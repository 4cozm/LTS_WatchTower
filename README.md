# LTS WatchTower

고정 IP 제약 해결 및 내부 시스템 모니터링, 카카오 알림톡 발송, 사용자 약관 동의 처리를 통합 수행하는 경량 게이트웨이 서버

*   **핵심 기능**: 서버 상태 감시(Monitoring) + 메시지 서빙(Messaging) + 약관 동의 처리(Web Entry)
*   **프로토콜 브릿지**: 내부 전용 바이너리 프로토콜(Protobuf)과 외부 인프라(HTTP) 간의 통신 중계

## 1. 왜 이 프로젝트가 필요한가

*   **외부 API 연동용 고정 IP 확보**: 카카오 알림톡 발송(Aligo) 시 보안 정책상 등록된 특정 고정 IP에서만 API 호출이 가능함. 유동 IP 환경이나 IP 제한이 있는 내부 망 대신, 고정 IP가 확보된 WatchTower를 통해 알림 발송 창구를 단일화함
*   **시스템 가시성 확보**: 분산된 내부 터미널 서버들의 CPU, 메모리 상태를 중앙에서 실시간으로 수집하고 이상 징후를 파악할 수 있는 경량 모니터링 허브가 필요함
*   **사용자 접점 인터페이스 부재**: CLI 기반이나 백엔드로만 동작하는 내부 시스템을 대신하여, 일반 사용자가 접근하여 약관에 동의하고 데이터를 입력할 수 있는 웹 진입점을 제공함

## 2. 핵심 제약

*   **고정 IP 의존성**: Aligo API 호출은 사전에 화이트리스트로 등록된 WatchTower의 IP를 통해서만 수행되어야 함
*   **TCP 프레임 구조**: 모든 메시지는 `4-byte Big-Endian` 길이 헤더를 포함하는 프레임 구조를 따르며, Protobuf 역직렬화 시 엄격한 타입 검증이 요구됨
*   **인증 및 보안**: 외부 노출되는 서버 특성상 내부 시스템과의 연결 시 10초 이내의 인증 절차를 거쳐야 하며, 인증되지 않은 소켓은 즉시 차단함
*   **실시간성 요구**: 서버 상태 보고 및 알림 요청은 지연 없이 처리되어야 하므로, 차단형(Blocking) 로직을 최소화한 비동기 이벤트 루프 기반으로 동작함

## 3. 해결 전략

*   **3-in-1 통합 아키텍처**: 독립된 서비스로 운영될 수 있는 '모니터링', '메시징', '웹 서비스'를 하나의 경량 서버로 통합하여 운영 관리 포인트를 최소화함
*   **고정 IP 프록시 서빙**: 내부 시스템의 모든 외부 알림 요청을 수집하여 WatchTower 명의로 대리 발송함으로써 고정 IP 제약을 우회함
*   **Envelope 패턴 기반 멀티플렉싱**: 단일 TCP 세션 내에서 `oneof` 구조를 활용해 서로 다른 도메인(모니터링 데이터 vs 알림 요청)의 메시지를 효율적으로 구분 및 처리함
*   **Template 자동 캐싱**: 알림톡 템플릿 정보를 매 6시간마다 동기화하여 발송 시 발생하는 API 레이턴시를 제거하고 시스템 응답성을 높임

## 4. 아키텍처 / 데이터 흐름

### 전체 시스템 흐름
1.  **감시(Monitoring)**: 내부 서버가 Protobuf `ServerStatus` 메시지를 전송 → WatchTower에서 수집 및 로깅
2.  **서빙(Messaging)**: 내부 서버가 `SendKakaoAlertNotification` 요청 → WatchTower가 고정 IP를 이용해 Aligo API 호출
3.  **동의(Terms)**: 일반 사용자가 웹 접속 → 약관 동의 → WatchTower가 `TermAgreed` 메시지로 내부 서버에 피드백

```text
[LTS Core Server] <---(TCP/Protobuf)---> [WatchTower (Fixed IP)] <---(HTTP/JSON)---> [Aligo/ntfy]
       |                                            |
       | (Status/Alert Request)                     | (AlimTalk/Alert)
       +--------------------------------------------+
                                            |
                                     (HTML / POST)
                                            |
                                      [End Users]
```

## 5. 주요 구현 포인트

*   **통합 핸들러 구조**: `protoHandlers` 객체를 통해 메시지 타입별 처리 로직을 모듈화하여 기능 확장(신규 알림 채널 추가 등) 시 기존 코드 수정을 최소화함
*   **안정적인 TCP 프레이밍**: 스트림 데이터 유입 시 버퍼링 및 길이 헤더 분석을 통해 메시지 유실이나 잘림 현상(Fragmentation) 없이 정확한 직렬화 데이터 추출
*   **고성능 메시지 치환**: 템플릿 내 변수(`#{key}`)를 정규표현식으로 고속 치환하여 대량의 알림 요청 발생 시에도 낮은 CPU 점유율 유지

## 6. 운영 관점에서 중요했던 점

*   **세션 지속성 확인**: `authedSocket`의 가용 상태(destroyed, writable)를 매 요청마다 검증하여 내부 시스템과의 연결 단절 시 알림 유실 방지 및 에러 트래킹
*   **환경 변수 기반 보안**: API Key 및 송신자 정보 등 핵심 자산을 `.env`로 격리하여 보안 사고 예방
*   **Docker 기반 배포**: 고정 IP 환경의 인프라 어디서든 동일한 환경으로 구동 가능하도록 컨테이너화 지원

## 7. 트레이드오프와 한계

*   **단일 지점 실패(SPOF)**: 모든 알림과 모니터링이 WatchTower를 거치므로, 본 서버 장애 시 외부 통신이 전면 차단됨. 이를 위해 `ntfy` 등을 통한 자체 장애 알림 메커니즘을 병행함
*   **세션 관리 복잡도**: 단일 `authedSocket` 관리 방식으로 인해 다수의 내부 시스템이 동시 연결될 경우 세션 충돌 가능성이 있음. 현재는 단일 LTS Core 환경에 최적화되어 있음

## 8. 사용 기술

*   **Backend**: Node.js (Express 5.x)
*   **Protocol**: TCP, Protobuf (protobufjs)
*   **Monitoring**: node-cron (Periodic Template Refresh)
*   **Messaging**: Aligo Kakao API, ntfy

## 9. 참고 링크

*   **Proto Definition**: `proto/common.proto`
*   **Notification Provider**: [Aligo API](https://kakaoapi.aligo.in/)
*   **Infrastructure**: [ntfy.sh](https://ntfy.sh/)

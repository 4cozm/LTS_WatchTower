import { protoHandlers } from '../proto/protoHandler.js';
import { getMessageType } from './protobufService.js';

export function createSocketHandler(socket) {
  let isAuthenticated = false; // ← 인증 상태

  const authTimeout = setTimeout(() => {
    if (!isAuthenticated) {
      console.warn('인증 실패로 연결 종료:', socket.remoteAddress);
      socket.destroy(); // 연결 강제 종료
    }
  }, 10_000); // 10초

  let buffer = Buffer.alloc(0);

  socket.on('data', data => {
    buffer = Buffer.concat([buffer, data]);

    while (buffer.length >= 4) {
      // 메시지 길이 파악
      const msgLength = buffer.readUInt32BE(0);

      if (buffer.length < 4 + msgLength) break; // 메시지가 아직 덜 왔음

      const messageBody = buffer.slice(4, 4 + msgLength);
      buffer = buffer.slice(4 + msgLength); // 다음 메시지 준비

      try {
        const Envelope = getMessageType('Envelope');
        const decoded = Envelope.decode(messageBody);
        const payloadType = Object.keys(decoded)[0];
        // 분기 처리

        const handler = protoHandlers[payloadType];

        if (handler) {
          if (payloadType === 'auth') {
            handler(decoded[payloadType], socket, () => {
              isAuthenticated = true;
              clearTimeout(authTimeout); // 인증되었으니 타이머 제거
            });
          } else {
            if (!isAuthenticated) {
              console.warn('인증되지 않은 소켓에서 메시지 수신됨:', payloadType);
              return;
            }

            handler(decoded[payloadType], socket); // 정상 처리
          }
        }
      } catch (err) {
        console.error('역직렬화 실패:', err);
      }
    }
  });

  socket.on('close', () => {
    console.log('클라이언트 연결 종료 :', socket.remoteAddress);
  });
}

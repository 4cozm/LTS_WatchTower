let authedSocket = null;

export function setAuthedSocket(socket) {
  authedSocket = socket;
}

export function getAuthedSocket() {
  if (
    authedSocket &&
    !authedSocket.destroyed && // ⛔ 끊긴 소켓은 제외
    authedSocket.writable // ✅ 쓰기가 가능한 상태여야 함
  ) {
    return authedSocket;
  }
  //TODO ntfy로 알림 발송
  throw new Error('응답 가능한 TCP 서버가 존재하지 않습니다');
}

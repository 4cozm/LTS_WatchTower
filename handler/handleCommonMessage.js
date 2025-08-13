export default function handleCommonMessage(payload, socket) {
  console.log(`${Date.now()}:${socket.remoteAddress}로 부터 메세지 도착함 :${payload.message}`);
}

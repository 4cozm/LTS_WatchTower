import { protoHandlers } from '../proto/protoHandler.js';
import { getMessageType } from './protobufService.js';
export function createSocketHandler(socket) {
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
        const payloadType = decoded.Object.keys(decoded)[0];
        // 분기 처리

        const handler = protoHandlers[payloadType];

        if (handler) {
          handler(decoded[payloadType], socket); // 메시지 객체와 연결 소켓을 전달
        } else {
          console.warn('지원하지 않는 메시지:', payloadType);
        }
      } catch (err) {
        console.error('역직렬화 실패:', err.message);
      }
    }
  });

  socket.on('close', () => {
    console.log('클라이언트 연결 종료 :', socket.remoteAddress);
  });
}

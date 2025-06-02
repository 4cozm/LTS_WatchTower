import dotenv from 'dotenv';
import net from 'net';
import { loadProto } from './services/protobufService.js';
import { createSocketHandler } from './services/TcpReciveService.js';

dotenv.config();

const PORT = 4000;

async function startServer() {
  await loadProto();
  console.log('proto 로딩 완료');

  const server = net.createServer(socket => {
    console.log('클라이언트 연결됨 :', socket.remoteAddress);
    createSocketHandler(socket);
  });

  server.listen(PORT, () => {
    console.log(`TCP 서버 포트 ${PORT}에서 대기 중`);
  });
}

startServer();

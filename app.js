import dotenv from 'dotenv';
import express from 'express';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { initTemplateJob } from './jobs/refreshTemplate.js';
import prepaidRoute from './routers/prepaidTermRouter.js';
import { loadProto } from './services/protobufService.js';
import { createSocketHandler } from './services/tcpReceiveService.js';

dotenv.config();

const PORT = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    await loadProto();
    console.log('proto 로딩 완료');
    await initTemplateJob();
  } catch (e) {
    console.log('⚠️ 서버 종료 ⚠️', e);
    process.exit(1);
  }

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/static', express.static(path.join(__dirname, 'views')));
  app.use('/', prepaidRoute);
  app.get('/', (req, res) => {
    res.send('✅ 웹 서버가 실행 중입니다.');
  });

  app.listen(80, () => {
    console.log(`🟢 HTTP 서버 대기 중`);
  });

  const server = net.createServer(socket => {
    console.log('클라이언트 연결됨 :', socket.remoteAddress);
    createSocketHandler(socket);
  });

  server.listen(PORT, () => {
    console.log(`🟢 TCP 서버 포트 ${PORT}에서 대기 중`);
  });
}

startServer();

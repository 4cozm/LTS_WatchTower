import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { initTemplateJob } from "./jobs/refreshTemplate.js";
import { sendAlertTalk } from "./services/aligoService.js";
import sendToNtfy from "./services/ntfyService.js";
import { WebSocketWatcher } from "./services/webSocketWatcher.js";
dotenv.config();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
WebSocketWatcher(io); //웹 소켓 미연결 감시 시작

io.on("connection", (socket) => {
  console.log(`📡 클라이언트 연결: ${socket.id}`);

  socket.on("sendAlertTalk", async (data) => {
    console.log("📨 알림톡 요청 수신:", data);

    try {
      const result = await sendAlertTalk(data);
      socket.emit("sendSuccess", result);
    } catch (err) {
      socket.emit("sendError", { error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ 연결 종료: ${socket.id} 종료 시각:${Date.now()}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`🚀 WebSocket 서버 실행 중 (ws://localhost:${PORT})`);
  sendToNtfy("server/start", { title: "Server Started", message: "Watch Tower Server is now online" });
  await initTemplateJob();
});

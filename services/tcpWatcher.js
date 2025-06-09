//웹 소켓에 연결된 클라이언트가 0개면 알림

import sendToNtfy from "./ntfyService.js";

let lastNoClientTime = null;

export const WebSocketWatcher = (io) => {
  setInterval(() => {
    const connectedCount = io.engine.clientsCount;
    const now = Date.now();

    if (connectedCount === 0) {
      console.log("현재 연결된 클라이언트 수 : 0");
      if (!lastNoClientTime) {
        lastNoClientTime = now;
      } else if (now - lastNoClientTime > 10 * 60 * 1000) {
        // 10분
        console.warn("🚨 10분 이상 클라이언트 미연결 상태!");

        sendToNtfy("server/down", {
          title: "🚨 SERVER DOWN ALERT",
          message: "The server has been unresponsive for 10 minutes, and it appears to be down",
          priority:"urgent"
        });
        //TODO 구글 캘린더 기반으로 현재 근무중인 직원에게 카카오톡 알림 보내기

        // 한 번만 알림 보내고, 중복 방지
        lastNoClientTime = null;
      }
    } else {
      // 클라이언트가 연결되었으면 타이머 초기화
      lastNoClientTime = null;
    }
  }, 60 * 1000); // 1분마다 감시
};

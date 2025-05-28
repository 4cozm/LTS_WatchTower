import dotenv from "dotenv";
import express from "express";
import { initTemplateJob } from "./jobs/refreshTemplate.js";
import { sendAlertTalk } from "./services/aligoService.js";
dotenv.config();

const app = express();
const PORT = 3000;

// JSON, x-www-form-urlencoded 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우터
app.get("/", (req, res) => {
  res.send("Hello");
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  await initTemplateJob();
  await sendAlertTalk("직원 등록 안내", "01088205076", {
    직원명: "안홍걸",
    이니셜: "AHG",
    전화번호: "01088205076",
  });
});

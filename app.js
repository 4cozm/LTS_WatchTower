import express from "express";
import dotenv from "dotenv";
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
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

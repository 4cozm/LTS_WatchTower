import path from 'path';
import { fileURLToPath } from 'url';
import getTermVersion from '../services/getTermVersion.js';
import { encodeProtoMessage } from '../services/protobufService.js';
import { getAuthedSocket } from '../services/tcpSession.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ GET /prepaidterm
export function getPrepaidTerm(req, res) {
  res.sendFile('prepaidTerm.html', { root: path.join(__dirname, '../views/prepaid') });
}

// ✅ POST /prepaidterm
export function postPrepaidTerm(req, res) {
  try {
    const { name, phone, consent } = req.body;

    if (!name || !phone || consent !== 'on') {
      return res.status(400).send('이름, 전화번호, 약관 동의는 모두 필수입니다.');
    }

    // LTS 서버로 내용 프로토 메세지로 전달
    const successMsg = encodeProtoMessage('termAgreed', {
      name: name,
      phoneNumber: phone,
      TermVersion: getTermVersion(),
    });
    let socket = getAuthedSocket();
    socket.write(successMsg);
    res.status(200).send(success);
  } catch (e) {
    return res.status(500).send('매장 서버가 응답하지 않습니다. 직원에게 문의해 주세요');
  }
}

const success = `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>약관 동의 완료</title>
    <style>
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        font-family: sans-serif;
        background-color: #f8f9fa;
        color: #212529;
        text-align: center;
      }
      .message-box {
        padding: 2rem;
        border-radius: 1rem;
        background-color: white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .emoji {
        font-size: 2rem;
        display: block;
        margin-bottom: 1rem;
      }
    </style>
  </head>
  <body>
    <div class="message-box">
      <span class="emoji">✅</span>
      <h1>약관 동의가 완료되었습니다</h1>
    </div>
  </body>
  </html>
`;

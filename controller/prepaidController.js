import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ GET /prepaidterm
export function getPrepaidTerm(req, res) {
  res.sendFile('prepaidTerm.html', { root: path.join(__dirname, '../views/prepaid') });
}

// ✅ POST /prepaidterm
export function postPrepaidTerm(req, res) {
  const { name, phone, consent } = req.body;

  if (!name || !phone || consent !== 'on') {
    return res.status(400).send('이름, 전화번호, 약관 동의는 모두 필수입니다.');
  }

  // LTS 서버로 내용 프로토 메세지로 전달
  res.status(200).send('✅ 약관 동의가 완료되었습니다.');
}

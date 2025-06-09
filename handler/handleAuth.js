import crypto from 'crypto';
import { encodeProtoMessage } from '../services/protobufService.js';
import printDate from '../utils/printDate.js';

export default function handleAuth(payload, socket, onAuthSuccess) {
  const isValid = verifyAuth(payload.key, payload.timeStamp, payload.containerNumber);
  if (isValid) {
    console.log(printDate(), '인증 성공:', socket.remoteAddress);
    const successMsg = encodeProtoMessage('message', { message: 'Watch Tower에서의 인증을 성공했습니다.' });
    socket.write(successMsg);
    onAuthSuccess();
  } else {
    console.warn('인증 실패:', socket.remoteAddress);
    socket.destroy(); // 인증 실패시 바로 끊기
  }
}

function verifyAuth(key, timeStamp, containerNumber) {
  const sharedSecret = process.env.WATCH_TOWER_AUTH_SECRET;

  if (!sharedSecret) {
    console.error('환경 변수 WATCH_TOWER_AUTH_SECRET가 설정되지 않았습니다.');
    return false;
  }

  if (!timeStamp || typeof timeStamp.toString !== 'function') {
    console.error('timeStamp가 유효하지 않음:', timeStamp);
    return false;
  }
  const timeStr = timeStamp.toString();
  const expectedKey = crypto.createHmac('sha256', sharedSecret).update(timeStr).digest('hex');

  return expectedKey === key;
}

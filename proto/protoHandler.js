import handleKakaoAlertNotification from '../handler/handleKakaoAlertNotification.js';
import handlePing from '../handler/handlePing.js';
import handlePong from '../handler/handlePong.js';
import handleServerStatus from '../handler/handleServerStatus.js';
import handlentfyNotification from '../handler/handlentfyNotification.js';

export const protoHandlers = {
  ping: handlePing,
  pong: handlePong,
  status: handleServerStatus,
  kakao: handleKakaoAlertNotification,
  ntfy: handlentfyNotification,
};

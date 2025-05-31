/**
 * ntfy 토픽으로 푸시 알림을 전송합니다.
 *
 * 환경변수 ENVIRONMENT가 'development'로 설정된 경우, 실제 전송은 생략되고 콘솔에 로그만 출력됩니다.
 *
 * @param {string} topic - 알림을 보낼 ntfy 토픽 (예: 'server/down')
 * @param {Object} options - 알림 옵션 객체
 * @param {string} [options.title] - 알림 제목 (선택 사항)
 * @param {string} options.message - 알림 본문 내용 (필수)
 * @param {'default'|'min'|'low'|'high'|'urgent'} [options.priority] - 알림 우선순위 (선택 사항)
 * @param {string[]} [options.tags] - 알림에 추가할 태그 배열 (예: ['server', 'error']) (선택 사항)
 *
 * @returns {Promise<Response>|void} 개발 환경에서는 아무 작업도 하지 않으며, 운영 환경에서는 fetch Promise를 반환합니다.
 */
export function sendToNtfy(topic, options) {
  const { title, message, priority, tags } = options;
  if (process.env.ENVIRONMENT === "DEV") {
    console.log("[DEV] 알림 생략됨:", title, message, priority, tags);
    return;
  }

  const url = `http://localhost/${topic}`;
  const headers = {
    "Content-Type": "text/plain",
  };

  if (title) headers["Title"] = title;
  if (priority) headers["Priority"] = priority;
  if (tags && Array.isArray(tags)) headers["Tags"] = tags.join(",");

  return fetch(url, {
    method: "POST",
    headers,
    body: message,
  });
}

export default sendToNtfy;

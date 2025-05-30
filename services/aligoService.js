import { getTemplateByTitle } from '../jobs/refreshTemplate.js';
/**
 *
 * @param {*} templateTitle 탬플릿 한글 이름
 * @param {*} receiver 받는 사람의 휴대전화 번호
 * @param {*} variables 탬플릿에 들어가는 변수
 * @returns
 */
export async function sendAlertTalk(templateTitle, receiver, variables = {}) {
  const template = getTemplateByTitle(templateTitle);

  if (!template) throw new Error(`템플릿 제목 "${templateTitle}"을 찾을 수 없습니다.`);

  const message = template.templtContent.replace(/#\{(.*?)\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      throw new Error(`필요한 변수 "${key}"가 누락되었습니다.`);
    }
    return value;
  });
  // 전송 데이터 구성
  const form = new URLSearchParams();
  form.append('apikey', process.env.ALIGO_API_KEY);
  form.append('userid', process.env.ALIGO_USER_ID);
  form.append('senderkey', template.senderKey);
  form.append('tpl_code', template.templtCode);
  form.append('sender', process.env.ALIGO_SENDER_NUMBER);
  form.append('receiver_1', receiver);
  form.append('subject_1', template.templtName);
  form.append('message_1', message);
  form.append('emtitle_1', template.templtTitle); //강조표기형의 경우 필수임
  form.append('testMode', 'N'); //테스트모드

  const response = await fetch('https://kakaoapi.aligo.in/akv10/alimtalk/send/', {
    method: 'POST',
    body: form,
  });

  const result = await response.json();
  console.log("카카오 알림톡"+result.message);
  if (result.code !== 0) {
    console.error('알림톡 전송 실패:', result.message);
    throw new Error(result.message);
  }

  return result;
}

/**
 * 알리고 전송 내역 조회 (오늘 날짜 기준)
 * @returns {Promise<Object>} - 전송 내역 결과 객체
 */
export async function getTodayAligoSendHistory() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}${mm}${dd}`; // YYYYMMDD 형식

  const form = new URLSearchParams();
  form.append('apikey', process.env.ALIGO_API_KEY);
  form.append('userid', process.env.ALIGO_USER_ID);
  form.append('startdate', dateStr);
  form.append('enddate', dateStr);
  form.append('page', '1');
  form.append('limit', '50');

  const response = await fetch('https://kakaoapi.aligo.in/akv10/history/list/', {
    method: 'POST',
    body: form,
  });

  const result = await response.json();

  if (result.code !== 0) {
    console.error('전송 내역 조회 실패:', result.message);
    throw new Error(result.message);
  }

  console.log('[📜 오늘자 전송 내역]', JSON.stringify(result, null, 2));
  return result;
}

/**
 * 알리고 메시지 전송 결과 상세 조회
 * @param {string|number} mid - 메시지 고유 ID
 * @returns {Promise<Object>} - 상세 결과 객체
 */
export async function getAligoMessageDetail(mid) {
  if (!mid) throw new Error('메시지 고유 ID(mid)는 필수입니다.');

  const form = new URLSearchParams();
  form.append('apikey', process.env.ALIGO_API_KEY);
  form.append('userid', process.env.ALIGO_USER_ID);
  form.append('mid', mid);
  form.append('page', '1');
  form.append('limit', '50');

  const response = await fetch('https://kakaoapi.aligo.in/akv10/history/detail/', {
    method: 'POST',
    body: form,
  });

  const result = await response.json();

  if (result.code !== 0) {
    console.error('전송 상세 조회 실패:', result.message);
    throw new Error(result.message);
  }

  console.log('[📦 상세 조회 결과]', JSON.stringify(result, null, 2));
  return result;
}

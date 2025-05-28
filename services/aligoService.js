import { getTemplateByTitle } from "../jobs/refreshTemplate.js";
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

  // 변수 치환
  const message = template.templtContent.replace(/#\{(.*?)\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null) {
      throw new Error(`필요한 변수 "${key}"가 누락되었습니다.`);
    }
    return value;
  });
  const raw = template.templtContent;
  console.log("[RAW]" + JSON.stringify(raw)); // 플레이스홀더 남아 있는 “원본”
  const expected = raw.replace(/#\{(.*?)\}/g, (_, k) => variables[k]); // 치환 후 메시지
  console.log("[expected]", JSON.stringify(expected));
  const actual = message; // 이게 실제 form.append 에 쓰이는 그 변수
  console.log("[actual  ]", JSON.stringify(actual));

  // 전송 데이터 구성
  const form = new URLSearchParams();
  form.append("apikey", process.env.ALIGO_API_KEY);
  form.append("userid", process.env.ALIGO_USER_ID);
  form.append("senderkey", template.senderKey);
  form.append("tpl_code", template.templtCode);
  form.append("sender", process.env.ALIGO_SENDER_NUMBER);
  form.append("receiver_1", receiver);
  form.append("subject_1", template.templtTitle);
  form.append("message_1", message);
  form.append("testMode", "N"); //테스트모드

  const response = await fetch("https://kakaoapi.aligo.in/akv10/alimtalk/send/", {
    method: "POST",
    body: form,
  });

  const result = await response.json();
  console.log(result);
  if (result.code !== 0) {
    console.error("알림톡 전송 실패:", result.message);
    throw new Error(result.message);
  }

  return result;
}

function findDiffPositions(a, b) {
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    const ac = a.charCodeAt(i) || -1;
    const bc = b.charCodeAt(i) || -2;
    if (ac !== bc) {
      console.log(
        `pos ${i}: expected=0x${ac.toString(16)}('${a[i] || ""}') ` + `vs actual=0x${bc.toString(16)}('${b[i] || ""}')`
      );
    }
  }
}

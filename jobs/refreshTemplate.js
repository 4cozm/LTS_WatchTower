import cron from "node-cron";

var templateCache;
var lastUpdated;

export const initTemplateJob = async () => {
  // 애플리케이션 시작 시 초기 1회 실행
  await updateTemplateCache();

  // 매 6시간마다 실행 (매일 0시, 6시, 12시, 18시에 실행됨)
  cron.schedule("0 */6 * * *", async () => {
    console.log("[cron] 템플릿 캐시 자동 갱신 시작");
    await updateTemplateCache();
  });
};

async function updateTemplateCache() {
  const form = new URLSearchParams();
  form.append("apikey", process.env.ALIGO_API_KEY);
  form.append("userid", process.env.ALIGO_USER_ID);
  form.append("senderkey", process.env.ALIGO_SENDER_KEY);

  try {
    const res = await fetch("https://kakaoapi.aligo.in/akv10/template/list/", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    if (data.code !== 0) {
      throw new Error(`알림톡 템플릿 조회 실패: ${data.message}`);
    }

    // templtTitle 기준으로 캐시 구성
    const newCache = {};
    for (const item of data.list) {
      if (item.templtTitle) {
        newCache[item.templtTitle] = item;
      }
    }

    templateCache = newCache;
    lastUpdated = new Date();

    console.log(`[템플릿 캐시] ${lastUpdated.toISOString()}에 ${Object.keys(templateCache).length}개 템플릿 로드됨`);
  } catch (err) {
    console.error("템플릿 캐시 업데이트 실패:", err.message);
    throw err;
  }
}

// 외부에서 캐시 접근할 수 있도록 getter 제공
export function getTemplateByTitle(title) {
  try {
    if (!templateCache || typeof templateCache !== "object") {
      throw new Error("템플릿 캐시가 초기화되지 않았습니다.");
    }

    const template = templateCache[title];
    if (!template) {
      const availableTitles = Object.keys(templateCache).join(", ");
      throw new Error(`템플릿 제목 ${title}을 찾을 수 없습니다. 현재 사용 가능한 제목:\n${availableTitles}`);
    }

    return template;
  } catch (e) {
    throw e;
  }
}

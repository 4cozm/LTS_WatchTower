import { sendAlertTalk } from "../services/aligoService.js";
import printDate from "../utils/printDate.js";

export default async function handleKakaoAlertNotification(payload, socket) {
    console.log(printDate, "카카오 알림 전달 요청 받음");
    try {
        await sendAlertTalk(payload.templateTitle, payload.receiver, payload.variables);
    } catch (e) {
        console.error("카카오 알림 전달 핸들러에서 오류 발생", e);
    }
}

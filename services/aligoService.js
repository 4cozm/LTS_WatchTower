import axios from "axios";
import qs from "qs";

export async function sendMessage(to, msg) {
  const data = {
    key: process.env.ALIGO_KEY,
    user_id: process.env.ALIGO_ID,
    sender: process.env.ALIGO_SENDER,
    receiver: to,
    msg,
    testmode_yn: "N"
  };

  const res = await axios.post(
    "https://apis.aligo.in/send/",
    qs.stringify(data),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return res.data;
}

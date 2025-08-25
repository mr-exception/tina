import axios from "axios";
function tgToken() {
  return process.env.TG_BOT_TOKEN || "";
}

interface ISendMessageParams {
  chat_id: string;
  text: string;
}
export async function sendMessage(params: ISendMessageParams) {
  return axios.post(`https://api.telegram.org/bot${tgToken()}/sendMessage`, params);
}

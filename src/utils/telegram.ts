import axios, { AxiosError } from "axios";
function tgToken() {
  return process.env.TG_BOT_TOKEN || "";
}

function parseToMarkdownV2(text: string) {
  let result = text.replace(/([.!#\(\)-=\[\]{}])/g, "\\$1");
  // result = result.replace(/[#]+/g, "");
  return result;
}

interface ISendMessageParams {
  chat_id: string;
  text: string;
}
export async function sendMessage(params: ISendMessageParams) {
  return axios
    .post(`https://api.telegram.org/bot${tgToken()}/sendMessage`, {
      ...params,
      text: parseToMarkdownV2(params.text),
      parse_mode: "MarkdownV2",
    })
    .catch((e) => {
      const err = e as AxiosError;
      console.log("params", params);
      console.log("data", err.response?.data);
      // console.log({ params, data: err.response?.data });
      throw new Error("Failed to send telegram message");
    });
}

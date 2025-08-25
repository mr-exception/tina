import { Request, Response } from "express";
import { ITelegramUpdate } from "../specs/telegram";
import { sendMessage } from "../utils/telegram";

export default function handleInteractTelegram(req: Request, res: Response) {
  const payload = req.body as ITelegramUpdate;
  sendMessage({
    chat_id: payload.message.chat.id,
    text: `Hello ${payload.message.from.first_name}!`,
  });
  return res.send({ message: "ok" });
}

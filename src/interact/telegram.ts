import { Request, Response } from "express";
import { ITelegramUpdate } from "../specs/telegram";
import { sendMessage } from "../utils/telegram";
import { IUser, UserModel } from "../db/user";
import { MessageModel } from "../db/message";
import { now } from "../utils/time";
import { handleCyclingFlow } from "../handle/handle";

export default async function handleInteractTelegram(req: Request, res: Response) {
  const payload = req.body as ITelegramUpdate;
  try {
    const user = await registerUser(payload);

    await createUserMessage(payload, user);
    console.log(user.username + ":", payload.message.text);

    await handleCyclingFlow({
      user,
      sourceConnection: { source: "telegram-chat", refId: payload.message.chat.id },
    });
    return res.send({ message: "ok" });
  } catch (err) {
    console.log((err as Error).message);
    await sendMessage({
      chat_id: payload.message.chat.id,
      text: "something went wrong. Please try again later.",
    });
    return res.send({ message: "ok" });
  }
}

async function registerUser(payload: ITelegramUpdate) {
  const user = await UserModel.findOne({ username: `tg${payload.message.from.id}` });
  if (!user) {
    const userData: Partial<IUser> = {
      username: `tg${payload.message.from.id}`,
      password: "none",
      connections: [
        { source: "telegram-chat", refId: payload.message.chat.id },
        { source: "telegram-user", refId: payload.message.from.id },
      ],
      toc: {
        status: "rejected",
        updatedAt: now(),
      },
      usage: {
        usage: 0,
        credit: 0,
        usageSoftLimit: 500,
        usageHardLimit: 1000,
      },
    };
    return UserModel.create(userData);
  } else {
    return user;
  }
}

async function createUserMessage(payload: ITelegramUpdate, user: IUser) {
  return MessageModel.create({
    body: payload.message.text || "",
    type: "text",
    connection: { source: "telegram-chat", refId: payload.message.chat.id },
    user: {
      _id: user._id,
      name: user.username,
    },
    createdAt: now(),
    updatedAt: now(),
  });
}

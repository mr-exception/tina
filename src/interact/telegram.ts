import { Request, Response } from "express";
import { ITelegramUpdate } from "../specs/telegram";
import { sendMessage } from "../utils/telegram";
import { IUser, UserModel } from "../db/user";
import { openaiChatCompletion } from "../utils/openai";
import { getLastTopicMessages, MessageModel } from "../db/message";
import { Types } from "mongoose";
import { now } from "../utils/time";

export default async function handleInteractTelegram(req: Request, res: Response) {
  const payload = req.body as ITelegramUpdate;
  try {
    const user = await registerUser(payload);

    await createUserMessage(payload, user);
    console.log("created message");
    const messages = await getLastTopicMessages({
      connectionSource: "telegram-chat",
      connectionRefId: payload.message.chat.id,
    });
    const response = await openaiChatCompletion(
      messages.map((item) => {
        if (item.user._id === new Types.ObjectId("000000000000000000000000")) {
          return {
            role: "assistant",
            content: item.body,
          };
        } else {
          return {
            role: "user",
            content: item.body,
          };
        }
      })
    );
    sendMessage({
      chat_id: payload.message.chat.id,
      text: response.content || "",
    });
    await MessageModel.create({
      body: response.content || "",
      type: "text",
      connection: { source: "telegram-chat", refId: payload.message.chat.id },
      user: {
        _id: new Types.ObjectId("000000000000000000000000"),
        name: "tina",
      },
      createdAt: now(),
      updatedAt: now(),
    });
    return res.send({ message: "ok" });
  } catch (err) {
    console.log(err);
    sendMessage({
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

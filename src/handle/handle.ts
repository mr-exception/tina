import mongoose, { now, Types } from "mongoose";
import { getLastTopicMessages, ICallResponse, IMessage, MessageModel } from "../db/message";
import { submitUserUsage, UserDoc } from "../db/user";
import {
  embeddData,
  IOpenAIMessage,
  IToolDefinition,
  openaiChatCompletion,
  OpenAIMessageRole,
} from "../utils/openai";
import { AxiosError } from "axios";
import { getSessionRelatedCalls } from "./calls";
import { convertMessages } from "./convertion";
import { sendMessage } from "../utils/telegram";

import { handleToC, ToCSystemPrompt, tocUpdateTool } from "./calls/toc";
import { handleAuthenticate } from "./calls/authenticate";

import { log } from "../utils/logger";
import { handleGetBalance } from "./calls/getBalance";
import { handleSetJob } from "./calls/setJob";
import { handleSetTimezone } from "./calls/setTimezone";

function generateDefaultSystemContext() {
  return `your name is tina\ndate is ${new Date().toLocaleDateString()}\nyour outputs are telegram compatible markdown v2 format\n`;
}

export async function handleCompletion(user: UserDoc, messageRecords: IMessage[]) {
  const messages: IOpenAIMessage[] = convertMessages(messageRecords);
  const tools: IToolDefinition[] = [];
  const defaultSystemContext = generateDefaultSystemContext();
  if (user.toc.status !== "accepted") {
    messages.unshift({
      role: "system",
      content: defaultSystemContext + ToCSystemPrompt,
    });
    tools.push(tocUpdateTool);
  } else {
    messages.unshift({
      role: "system",
      content: defaultSystemContext,
    });
  }
  const calls = await getSessionRelatedCalls(messages);
  calls.forEach((call) => {
    tools.push({
      type: "function",
      function: {
        name: call.name,
        description: call.description,
        parameters: call.parameters,
        strict: true,
      },
    });
  });
  try {
    return openaiChatCompletion({ messages, tools: tools });
  } catch (err) {
    const error = err as AxiosError;
    log(error.response!.data);
  }
}

interface IHandleCyclingFlowParams {
  user: UserDoc;
  sourceConnection?: {
    source: string;
    refId: string;
  };
}
export async function handleCyclingFlow({ user, sourceConnection }: IHandleCyclingFlowParams) {
  if (!sourceConnection) throw new Error("no source connection");
  while (true) {
    const messages = await getLastTopicMessages({
      connectionSource: sourceConnection.source,
      connectionRefId: sourceConnection.refId,
    });
    const response = await handleCompletion(user, messages);
    if (!response) throw new Error("no response");

    await submitUserUsage(user._id, response.usage);

    if (response.type === "content") {
      await sendMessage({
        chat_id: sourceConnection.refId,
        text: response.content,
      });
      log("tina:", response.content);
      await MessageModel.create({
        body: response.content,
        type: "text",
        connection: sourceConnection,
        user: {
          _id: new Types.ObjectId("000000000000000000000000"),
          name: "tina",
        },
        createdAt: now(),
        updatedAt: now(),
      });
      break;
    } else if (response.type === "call") {
      const callRequest = {
        id: response.id,
        name: response.name,
        parameters: JSON.stringify(response.parameters),
      };
      log("tina:", callRequest.name, callRequest.parameters);
      let callResponse: ICallResponse;
      try {
        switch (response.name) {
          case "tocUpdate":
            callResponse = await handleToC(user, response);
            break;
          case "authenticate":
            callResponse = await handleAuthenticate(user, response);
            break;
          case "getBalance":
            callResponse = await handleGetBalance(user, response);
            break;
          case "setTimezone":
            callResponse = await handleSetTimezone(user, response);
            break;
          case "setJob":
            callResponse = await handleSetJob(user, response);
            break;
          default:
            callResponse = {
              id: response.id,
              name: response.name,
              result: "no such action found",
            };
        }
      } catch (err) {
        log(err);
        callResponse = {
          id: response.id,
          name: response.name,
          result: "no such action found",
        };
      }

      log("tina:", callResponse.name, callResponse.result);
      await MessageModel.create({
        body: JSON.stringify({ callRequest, callResponse }),
        type: "call",
        callRequest,
        callResponse,
        connection: sourceConnection,
        user: {
          _id: new Types.ObjectId("000000000000000000000000"),
          name: "tina",
        },
        createdAt: now(),
        updatedAt: now(),
      });
    } else {
      throw new Error(`unknown response ${JSON.stringify(response)}`);
    }
  }
}

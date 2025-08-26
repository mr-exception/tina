import { IMessage } from "../db/message";
import { IOpenAIMessage } from "../utils/openai";

export function convertMessages(messageRecords: IMessage[]) {
  const result: IOpenAIMessage[] = [];
  messageRecords.forEach((message) => {
    if (message.type === "text") {
      result.push(convertTextMessage(message));
    } else if (message.type === "call") {
      const messages = convertCallMessage(message);
      messages.forEach((msg) => result.push(msg));
    }
  });
  return result;
}

function convertTextMessage(message: IMessage) {
  const result: IOpenAIMessage = {
    role: "assistant",
    content: message.body,
  };
  if (message.user.name !== "tina") {
    result.role = "user";
  }
  return result;
}

function convertCallMessage(message: IMessage) {
  const result: IOpenAIMessage[] = [];
  if (message.callRequest) {
    result.push({
      role: "assistant",
      tool_call_id: message.callRequest.id,
      tool_calls: [
        {
          id: message.callRequest.id,
          type: "function",
          function: { name: message.callRequest.name, arguments: message.callRequest.parameters },
        },
      ],
    });
  }
  if (message.callResponse) {
    result.push({
      role: "tool",
      tool_call_id: message.callResponse.id,
      content: message.callResponse.result,
    });
  }
  return result;
}

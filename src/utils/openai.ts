import axios from "axios";

export interface IOpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface IOpenAIResponse {
  id: string;
  object: string;
  choices: { index: number; message: IOpenAIMessage; finish_reason: string }[];
  usage: {
    total_tokens: number;
  };
}

export async function openaiChatCompletion(messages: IOpenAIMessage[]): Promise<IOpenAIParsedResponse> {
  console.log(messages);
  const response = await axios
    .post<IOpenAIResponse>(
      "https://api.openai.com/v1/chat/completions",
      { messages, model: "gpt-4o-mini", max_tokens: 820 },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    )
    .then((res) => res.data);
  const choices = response.choices;
  if (choices.length === 0) {
    throw new Error("No choices returned");
  }
  const choice = response.choices[0];
  if (choice.message.content) {
    return {
      usage: response.usage.total_tokens,
      content: choice.message.content,
    };
  } else {
    return {
      usage: response.usage.total_tokens,
    };
  }
}

export interface IOpenAIParsedResponse {
  content?: string;
  callId?: string;
  callName?: string;
  callParameters?: { [key: string]: string };
  usage: number;
}

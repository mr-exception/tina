import axios, { AxiosError } from "axios";
import { ModelResponse } from "../specs/interaction";
import { log } from "./logger";

export type OpenAIMessageRole = "system" | "user" | "assistant" | "tool";
export interface IOpenAIMessage {
  role: OpenAIMessageRole;
  content?: string;
  tool_call_id?: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface IOpenAIResponse {
  id: string;
  object: string;
  choices: { index: number; message: IOpenAIMessage; finish_reason: string }[];
  usage: {
    total_tokens: number;
  };
}

export interface IToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: any;
      additionalProperties: boolean;
    };
  };
  strict: boolean;
}

export interface IOpenAIParams {
  messages: IOpenAIMessage[];
  tools?: IToolDefinition[];
}

export async function openaiChatCompletion({ messages, tools }: IOpenAIParams): Promise<ModelResponse> {
  try {
    const response = await axios
      .post<IOpenAIResponse>(
        "https://api.openai.com/v1/chat/completions",
        { messages, tools, model: "gpt-4o-mini", max_completion_tokens: 820 },
        { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
      )
      .then((res) => res.data);
    const choices = response.choices;
    if (choices.length === 0) {
      throw new Error("No choices returned");
    }
    const { message } = response.choices[0];
    if (message.content) {
      return {
        type: "content",
        usage: response.usage.total_tokens / 1000,
        content: message.content,
      };
    } else if (message.tool_calls) {
      const [call] = message.tool_calls;
      return {
        type: "call",
        usage: response.usage.total_tokens / 1000,
        id: call.id,
        name: call.function.name,
        parameters: JSON.parse(call.function.arguments),
      };
    } else {
      return {
        type: "none",
        usage: response.usage.total_tokens / 1000,
      };
    }
  } catch (err) {
    const error = err as AxiosError;
    log(error.response!.data);
    throw err;
  }
}

interface IEmbeddingResponse {
  data: { embedding: number[] }[];
}
export async function embeddData(input: string): Promise<number[]> {
  const response = await axios
    .post<IEmbeddingResponse>(
      "https://api.openai.com/v1/embeddings",
      {
        input,
        model: "text-embedding-3-large",
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    )
    .then((response) => response.data);
  if (response.data.length === 0) {
    throw new Error("No embeddings returned");
  }
  return response.data[0].embedding;
}

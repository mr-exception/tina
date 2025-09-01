import axios from "axios";
import { JobDoc } from "../../db/job";
import { ICallResponse } from "../../db/message";
import { submitUserUsage, UserDoc, UserModel } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";
import { IOpenAIMessage, IToolDefinition, openaiChatCompletion } from "../../utils/openai";
import { sendMessage } from "../../utils/telegram";
import { IntergationModel } from "../../db/integration";
import mongoose, { mongo } from "mongoose";
import { getClickupTasks } from "../../integrations/clickup";

const systemContext = `
users provides you a task you have to perform on clickup and report back the result they want.
use available functions to perform the task and provide the final result for user
`;
const tools: IToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "getWorkspaces",
      description: "get list of workspaces",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
        required: [],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "getFolders",
      description: "get list of folders inside a workspace",
      parameters: {
        type: "object",
        properties: {
          workspaceId: {
            type: "string",
            description: "workspace id",
          },
        },
        additionalProperties: false,
        required: ["workspaceId"],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "getLists",
      description: "get lists of a folder",
      parameters: {
        type: "object",
        properties: {
          folderId: {
            type: "string",
            description: "folder id",
          },
        },
        additionalProperties: false,
        required: ["folderId"],
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "getTasks",
      description: "get tasks inside a list",
      parameters: {
        type: "object",
        properties: {
          listId: {
            type: "string",
            description: "list id",
          },
        },
        additionalProperties: false,
        required: ["listId"],
      },
      strict: true,
    },
  },
];

export default async function handler(job: JobDoc) {
  let messages: IOpenAIMessage[] = [];
  messages.push({ role: "system", content: systemContext });
  messages.push({ role: "user", content: job.definition });
  while (true) {
    const response = await openaiChatCompletion({ messages, tools });
    await submitUserUsage(job.user._id, response.usage);
    if (response.type === "none") {
      return false;
    } else if (response.type === "content") {
      await sendResults(job, response.content);
      return true;
    } else if (response.type === "call") {
      messages.push({
        role: "assistant",
        tool_call_id: response.id,
        tool_calls: [
          {
            type: "function",
            id: response.id,
            function: {
              name: response.name,
              arguments: JSON.stringify(response.parameters),
            },
          },
        ],
      });
      try {
        const result = await handleTools(job.user._id, response);
        messages.push({
          role: "tool",
          tool_call_id: result.id,
          content: result.result,
        });
      } catch (err) {
        return false;
      }
    }
  }
}

async function sendResults(job: JobDoc, results: string) {
  const user = await UserModel.findOne({ _id: job.user._id });
  if (!user) {
    throw new Error(`User ${job.user._id} does not exist`);
  }
  // find the telegram connection
  // TODO: this logic is not scalable, must be moved and refactored
  const connection = user.connections.find((item) => item.source === "telegram-chat");
  if (!connection) {
    throw new Error(`User ${user._id} has no connections`);
  }
  await sendMessage({ chat_id: connection.refId, text: results });
}

async function handleTools(userId: mongoose.Types.ObjectId, call: ModelCallResponse): Promise<ICallResponse> {
  const accessToken = await getClickupToken(userId);
  if (!accessToken)
    return {
      id: call.id,
      name: call.name,
      result: "I don't have access to your clickup account",
    };
  switch (call.name) {
    case "getWorkspaces":
      return {
        id: call.id,
        name: call.name,
        result: JSON.stringify([{ name: "workspace 1", id: "wid" }]),
      };
    case "getFolders":
      return {
        id: call.id,
        name: call.name,
        result: JSON.stringify([{ name: "folder 1", id: "fid" }]),
      };
    case "getLists":
      return {
        id: call.id,
        name: call.name,
        result: JSON.stringify([{ name: "features", id: "l1" }]),
      };
    case "getTasks": {
      const { listId } = call.parameters as { listId: string };
      const tasks = await getClickupTasks(listId, accessToken).then((data) =>
        data.map((task) => {
          return {
            url: task.url,
            tags: task.tags.map((tag) => tag.name),
            name: task.name,
            description: task.description,
            list: task.list.name,
          };
        })
      );
      return {
        id: call.id,
        name: call.name,
        result: JSON.stringify(tasks),
      };
    }
    default:
      throw new Error(`Unknown tool ${call.name}`);
  }
}

async function getClickupToken(userId: mongoose.Types.ObjectId) {
  const integration = await IntergationModel.findOne({ "user._id": userId, service: "clickup" });
  if (!integration) return;
  return integration.accessToken;
}

import { ICallResponse } from "../../db/message";
import { IUser, UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";
import { IToolDefinition } from "../../utils/openai";
import { now } from "../../utils/time";

export const ToCSystemPrompt = `user has not accepted the terms and conditions yet. please ask them to accept it before proceeding with any other interaction.

this is the term and conditions content:
some dummy terms and conditions here
link to more details: https://salimon.net/terms-and-conditions

please answer user questions about the terms and conditions.
`;

export const tocUpdateTool: IToolDefinition = {
  type: "function",
  function: {
    name: "tocUpdate",
    description: "updates the terms and conditions acceptance status of a user",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "the new status of the terms and conditions acceptance",
          enum: ["accepted", "rejected"],
        },
      },
      additionalProperties: false,
    },
  },
  strict: true,
};

type Paramaters = {
  status: "accepted" | "rejected";
};
export async function handleToC(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const status = (call.parameters as Paramaters).status;
  switch (status) {
    case "accepted":
      user.toc.status = "accepted";
      user.toc.updatedAt = now();
      await user.save();
      return {
        id: call.id,
        name: call.name,
        result: "user toc status updated to accepted",
      };
    case "rejected":
    default:
      user.toc.status = "rejected";
      user.toc.updatedAt = now();
      await user.save();
      return {
        id: call.id,
        name: call.name,
        result: "user toc status updated to rejected",
      };
  }
}

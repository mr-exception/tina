import { IJob, JobModel } from "../../db/job";
import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";
import { JobDefinition } from "../../specs/jobs";
import { log } from "../../utils/logger";
import { now } from "../../utils/time";

type Parameters = {
  type: "instant" | "interval";
  title: string;
  description: string;
  definition: JobDefinition;
};
export async function handleSetJob(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const parameters = call.parameters as Parameters;
  const job = await JobModel.create({
    createdAt: now(),
    updatedAt: now(),
    title: parameters.title,
    description: parameters.description,
    handler: parameters.definition.type,
    type: parameters.type,
    status: "idle",
    definition: JSON.stringify(parameters.definition),
    timing: parameters.type === "instant" ? "instant" : parameters.type,
    user: {
      _id: user._id,
      name: user.username,
    },
  });
  return {
    id: call.id,
    name: call.name,
    result: `I've created a job "${job.title}" and will work on it. I will report back when done.`,
  };
}

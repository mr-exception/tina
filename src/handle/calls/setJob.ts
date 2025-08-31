import { JobModel } from "../../db/job";
import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";
import { now } from "../../utils/time";

type Parameters = {
  runType: "instant" | "interval";
  schedule?: string;
  title: string;
  description: string;
  handler: string;
  definition: string;
};
export async function handleSetJob(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const parameters = call.parameters as Parameters;
  const job = await JobModel.create({
    createdAt: now(),
    updatedAt: now(),
    title: parameters.title,
    description: parameters.description,
    handler: parameters.handler,
    runType: parameters.runType,
    definition: parameters.definition,
    schedule: parameters.schedule,
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

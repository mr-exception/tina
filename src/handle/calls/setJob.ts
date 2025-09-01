import { IJob, JobModel } from "../../db/job";
import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";
import { now } from "../../utils/time";
import parser from "cron-parser";

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
  const jobData: Partial<IJob> = {
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
  };
  if (parameters.runType === "interval") {
    if (!user.timezone) {
      return {
        id: call.id,
        name: call.name,
        result: "You need to set your timezone first.",
      };
    }
    const interval = parser.parse(parameters.schedule || "* * * * *", { tz: user.timezone });
    interval.next().getTime();
    jobData.nextRun = interval.next().getTime();
  }
  await JobModel.create(jobData);
  return {
    id: call.id,
    name: call.name,
    result: `I've created a job "${jobData.title}" and will work on it. I will report back when done.`,
  };
}

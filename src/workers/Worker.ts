import { JobDoc } from "../db/job";
import parser from "cron-parser";
// handlers
import clickupTasksReportHandler from "./handlers/clickup-tasks-report";
import { UserModel } from "../db/user";

export default class Worker {
  public job?: JobDoc;
  public stauts: "idle" | "running" = "idle";
  public constructor(public readonly id: number) {}
  public async handle() {
    if (!this.job) throw new Error(`worker ${this.id} has no job to handle`);
    this.stauts = "running";
    await handle(this.job);
    await closeJob(this.job);
    this.stauts = "idle";
  }
}

async function handle(job: JobDoc) {
  switch (job.handler) {
    case "clickup:tasks:report":
      return clickupTasksReportHandler(job);
  }
}

async function closeJob(job: JobDoc) {
  if (job.runType === "instant") {
    // delete the job after it's done
    await job.deleteOne();
  } else {
    // set the next run time
    const user = await UserModel.findById(job.user._id);
    if (!user) throw new Error("User not found");
    const interval = parser.parse(job.schedule || "* * * * *", { tz: user.timezone });
    interval.next().getTime();
    job.nextRun = interval.next().getTime();
    await job.save();
  }
}

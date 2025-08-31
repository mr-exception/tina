import { JobDoc } from "../db/job";
// handlers
import clickupTasksReportHandler from "./handlers/clickup-tasks-report";

export default class Worker {
  public job?: JobDoc;
  public stauts: "idle" | "running" = "idle";
  public constructor(public readonly id: number) {}
  public async handle() {
    if (!this.job) throw new Error(`worker ${this.id} has no job to handle`);
    this.stauts = "running";
    await handle(this.job);
    await this.job.deleteOne();
    this.stauts = "idle";
  }
}

async function handle(job: JobDoc) {
  switch (job.handler) {
    case "clickup:tasks:report":
      return clickupTasksReportHandler(job);
  }
}

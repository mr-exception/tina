import { JobDoc, JobModel } from "../db/job";
import { now } from "../utils/time";
import Worker from "./Worker";

export default class WorkerPool {
  public pool: Worker[] = [];
  constructor(public poolSize = 3) {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(new Worker(i));
    }
    console.log(`worker pool created with ${this.pool.length} workers`);
  }
  public async start() {
    setInterval(() => {
      this.pool.forEach(async (w) => {
        this.feedWorker(w);
      });
    }, 5000);
  }
  private async feedWorker(worker: Worker) {
    if (worker.stauts === "idle") {
      const job = await JobModel.findOneAndUpdate(
        { runType: "instant", lockedAt: null },
        { $set: { lockedAt: now() } }
      );
      if (!job) {
        return;
      }
      worker.job = job;
      worker.handle();
    }
  }
}

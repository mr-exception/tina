import WorkerPool from "./WorkerPool";

export let workerPool: WorkerPool;
export async function setupJobs() {
  workerPool = new WorkerPool(1);
  workerPool.start();
}

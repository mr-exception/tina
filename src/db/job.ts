import { model, Schema } from "mongoose";
import { IDBRecord, IReference, ReferenceSchema } from "./common";
import { now } from "../utils/time";

export type JobType = "interval" | "instant";
export type JobStatus = "pending" | "running" | "completed" | "idle";
export interface IJob extends IDBRecord {
  user: IReference;
  title: string;
  description: string;
  definition: string;
  type: JobType;
  handler: string;
  timing: string;
  status: JobStatus;
}

const JobSchema = new Schema<IJob>({
  user: { type: ReferenceSchema, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  definition: { type: String, required: false },
  type: { type: String, required: true },
  handler: { type: String, required: true },
  timing: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: Number, required: true, default: now() },
  updatedAt: { type: Number, required: true, default: now() },
});

export const JobModel = model("job", JobSchema, "jobs");
export type JobDoc = IJob & Document;

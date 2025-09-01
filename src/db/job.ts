import { Document, model, Schema } from "mongoose";
import { IDBRecord, IReference, ReferenceSchema } from "./common";
import { now } from "../utils/time";

export type JobRunType = "interval" | "instant";
export interface IJob extends IDBRecord {
  user: IReference;
  title: string;
  description: string;
  definition: string;
  runType: JobRunType;
  schedule?: string;
  nextRun?: number;
  handler: string;
  lockedAt: number;
}

const JobSchema = new Schema<IJob>({
  user: { type: ReferenceSchema, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  definition: { type: String, required: false },
  runType: { type: String, required: true },
  schedule: { type: String, required: false },
  nextRun: { type: Number, required: false },
  handler: { type: String, required: true },
  lockedAt: { type: Number, required: false },
  createdAt: { type: Number, required: true, default: now() },
  updatedAt: { type: Number, required: true, default: now() },
});

export const JobModel = model("job", JobSchema, "jobs");
export type JobDoc = IJob & Document;

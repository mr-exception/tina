import { Document, model, Schema } from "mongoose";
import { IDBRecord, IReference, ReferenceSchema } from "./common";
import { now } from "../utils/time";

export interface IIntegration extends IDBRecord {
  user: IReference;
  service: string;
  accessToken?: string;
}

const IntegrationSchema = new Schema<IIntegration>({
  user: { type: ReferenceSchema, required: true },
  service: { type: String, required: true },
  accessToken: { type: String, required: false },
  createdAt: { type: Number, default: now(), required: true },
  updatedAt: { type: Number, default: now(), required: true },
});

export const IntergationModel = model("integration", IntegrationSchema, "integrations");
export type IntegrationDoc = IIntegration & Document;

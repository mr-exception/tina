import { now } from "../utils/time";
import { ConnectionSchema, IConnection, IDBRecord } from "./common";
import { Schema, model, Document } from "mongoose";

export interface IUser extends IDBRecord {
  username: string;
  password: string;
  connections: IConnection[];
  usage: IUserUsage;
}

export interface IUserUsage {
  credit: number;
  usage: number;
  usageSoftLimit: number;
  usageHardLimit: number;
}

const UserUsageSchema = new Schema<IUserUsage>({
  credit: { type: Number, default: 0 },
  usage: { type: Number, default: 0 },
  usageSoftLimit: { type: Number, default: 0 },
  usageHardLimit: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  connections: { type: [ConnectionSchema], default: [] },
  usage: { type: UserUsageSchema, required: true },
  createdAt: { type: Number, required: true, default: now() },
  updatedAt: { type: Number, required: true, default: now() },
});

export const UserModel = model("user", UserSchema, "users");

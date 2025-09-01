import { now } from "../utils/time";
import { ConnectionSchema, IConnection, IDBRecord } from "./common";
import { Schema, model, Document, Mongoose, Types } from "mongoose";

export interface IUser extends IDBRecord {
  username: string;
  password: string;
  connections: IConnection[];
  usage: IUserUsage;
  toc: IUserToC;
  timezone: string;
}

export interface IUserUsage {
  credit: number;
  usage: number;
  usageSoftLimit: number;
  usageHardLimit: number;
}

export interface IUserToC {
  status: "accepted" | "rejected";
  updatedAt: number;
}

const UserUsageSchema = new Schema<IUserUsage>({
  credit: { type: Number, default: 0 },
  usage: { type: Number, default: 0 },
  usageSoftLimit: { type: Number, default: 0 },
  usageHardLimit: { type: Number, default: 0 },
});

const UserToCSchema = new Schema<IUserToC>({
  status: { type: String, enum: ["accepted", "rejected"], required: true },
  updatedAt: { type: Number, required: true, default: now() },
});

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  connections: { type: [ConnectionSchema], default: [] },
  usage: { type: UserUsageSchema, required: true },
  toc: { type: UserToCSchema, required: true },
  timezone: { type: String, required: false },
  createdAt: { type: Number, required: true, default: now() },
  updatedAt: { type: Number, required: true, default: now() },
});

export const UserModel = model("user", UserSchema, "users");
export type UserDoc = IUser & Document;

export async function submitUserUsage(id: Types.ObjectId, amount: number) {
  return UserModel.findOneAndUpdate({ _id: id }, { $inc: { "usage.usage": amount } });
}

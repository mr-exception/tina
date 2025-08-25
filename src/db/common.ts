import mongoose from "mongoose";

export interface IDBRecord {
  _id: mongoose.Types.ObjectId;
  createdAt: number;
  updatedAt: number;
}

export interface IReference {
  _id: mongoose.Types.ObjectId;
  name: string;
}

export const ReferenceSchema = new mongoose.Schema<IReference>({
  name: { type: String, required: true },
});

export interface IConnection {
  source: string;
  refId: string;
}

export const ConnectionSchema = new mongoose.Schema<IConnection>({
  source: { type: String, required: true },
  refId: { type: String, required: true },
});

export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI || "", { authMechanism: "DEFAULT" });
  console.log("connected to db");
}

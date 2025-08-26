import mongoose, { connection, model, Schema } from "mongoose";
import { ConnectionSchema, IConnection, IDBRecord, IReference, ReferenceSchema } from "./common";
import { now } from "../utils/time";

export interface IMessage extends IDBRecord {
  body: string;
  type: string;
  thread?: IReference;
  connection?: IConnection;
  user: IReference;
  callRequest?: ICallRequest;
  callResponse?: ICallResponse;
}
export interface ICallRequest {
  name: string;
  id: string;
  parameters: string;
}
export interface ICallResponse {
  name: string;
  id: string;
  result: string;
}

const CallRequestSchema = new Schema<ICallRequest>({
  id: { type: String, required: true },
  name: { type: String, requred: true },
  parameters: { type: String, required: true },
});
const CallResponseSchema = new Schema<ICallResponse>({
  id: { type: String, required: true },
  name: { type: String, requred: true },
  result: { type: String, required: true },
});

const MessageSchema = new Schema<IMessage>({
  body: { type: String, required: false },
  type: { type: String, required: true },
  thread: { type: ReferenceSchema, required: false },
  connection: { type: ConnectionSchema, required: false },
  user: { type: ReferenceSchema, required: true },
  callRequest: { type: CallRequestSchema, required: false },
  callResponse: { type: CallResponseSchema, required: false },
  createdAt: { type: Number, default: now() },
  updatedAt: { type: Number, default: now() },
});

export const MessageModel = model<IMessage>("message", MessageSchema, "messages");

interface IGetLastTopicMessagesParams {
  connectionSource?: string;
  connectionRefId?: string;
  threadId?: mongoose.Types.ObjectId;
}
export async function getLastTopicMessages({
  connectionRefId,
  connectionSource,
  threadId,
}: IGetLastTopicMessagesParams) {
  if (connectionRefId && connectionSource) {
    return MessageModel.find({ "connection.source": connectionSource, "connection.refId": connectionRefId })
      .sort({ createdAt: -1 })
      .limit(5)
      .then((response) => response.reverse());
  } else if (threadId) {
    return MessageModel.find({ "thread._id": threadId })
      .sort({ createdAt: -1 })
      .limit(5)
      .then((response) => response.reverse());
  } else {
    throw new Error("No parameters provided");
  }
}

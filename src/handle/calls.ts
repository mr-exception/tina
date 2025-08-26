import { readFileSync } from "fs";
import { ICallDefinitionEmbedded } from "../specs/calls";
import { embeddData, IOpenAIMessage } from "../utils/openai";
import { log } from "../utils/logger";

let calls: ICallDefinitionEmbedded[] = [];
export function loadCalls() {
  calls = JSON.parse(readFileSync("./embedd-calls.json").toString()) as ICallDefinitionEmbedded[];
  log("calls loaded");
}

function getVectorDistance(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

export async function getSessionRelatedCalls(messages: IOpenAIMessage[]) {
  if (messages.length === 0) throw new Error("No messages provided");
  const sessionVectors = await embeddData(JSON.stringify(messages[messages.length - 1]));
  const relatedCalls: ICallDefinitionEmbedded[] = [];
  for (const call of calls) {
    const distance = getVectorDistance(sessionVectors, call.vectors);
    if (distance < 1.2) {
      relatedCalls.push(call);
    }
  }
  return relatedCalls;
}

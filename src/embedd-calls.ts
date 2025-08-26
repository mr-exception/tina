import axios, { AxiosError } from "axios";
import { ICallDefinition, ICallDefinitionEmbedded } from "./specs/calls";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import { embeddData } from "./utils/openai";
import { log } from "./utils/logger";
dotenv.config();

async function embedCall(call: ICallDefinition): Promise<ICallDefinitionEmbedded> {
  const vectors = await embeddData(JSON.stringify(call));
  return { ...call, vectors };
}

function readCalls() {
  const content = readFileSync("./calls.json");
  return JSON.parse(content.toString()) as ICallDefinition[];
}

async function main(): Promise<void> {
  try {
    const calls = readCalls();
    const embeddedCalls = await Promise.all(calls.map(embedCall));
    writeFileSync("./embedd-calls.json", JSON.stringify(embeddedCalls, undefined, 2));
  } catch (err) {
    const error = err as AxiosError;
    log(error.response!.data);
  }
}

main();

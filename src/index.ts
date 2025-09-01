import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { now } from "./utils/time";
import handleInteractTelegram from "./interact/telegram";
import { connectDB } from "./db/common";
import { loadCalls } from "./handle/calls";
import { log } from "./utils/logger";

// redirects
import redirectClickUp from "./redirects/clickup";
import { setupJobs } from "./workers/setup";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env["PORT"] || "8080";

app.get("/", (req: Request, res: Response) => {
  res.send({
    time: now(),
    service: "tina core service",
  });
});

app.post("/interact/telegram", handleInteractTelegram);

app.get("/redirect/clickup", redirectClickUp);

app.listen(PORT, () => {
  log(`Server running on http://localhost:${PORT}`);
});

connectDB().then(() => {
  loadCalls();
  setupJobs();
});

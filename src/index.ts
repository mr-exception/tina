import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { now } from "./utils/time";
import { ITelegramUpdate } from "./specs/telegram";
import handleInteractTelegram from "./interact/telegram";
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import axios from "axios";
import { Request, Response } from "express";
import { IntergationModel } from "../db/integration";
import { UserModel } from "../db/user";

export default async function handle(req: Request, res: Response) {
  const params = req.query as { code: string; state: string };
  try {
    // fetch access token
    const { access_token, token_type } = await axios
      .post<{ access_token: string; token_type: string }>("https://api.clickup.com/api/v2/oauth/token", {
        code: params.code,
        client_id: process.env.CLICKUP_CLIENT_ID,
        client_secret: process.env.CLICKUP_SECRET,
      })
      .then((response) => response.data);

    const user = await UserModel.findOne({ username: params.state });
    if (!user) {
      return res.send("user not found");
    }
    const integration = await IntergationModel.findOne({
      "user._id": user._id,
      service: "clickup",
    });
    if (integration) {
      return res.send("already authenticated");
    }
    await IntergationModel.create({
      accessToken: access_token,
      service: "clickup",
      user: {
        _id: user._id,
        name: user.username,
      },
    });
    res.send("authentication done");
  } catch (e) {
    console.log((e as Error).message);
    res.send("authentication failed");
  }
}

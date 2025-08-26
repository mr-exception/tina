import { IntergationModel } from "../../db/integration";
import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";

type Parameters = {
  service: string;
};
export async function handleAuthenticate(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const service = (call.parameters as Parameters).service;
  switch (service) {
    case "clickup":
      return handleClickup(user, call);
    default:
      return {
        id: call.id,
        name: call.name,
        result: "this service is not supported yet",
      };
  }
}

async function handleClickup(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const integration = await IntergationModel.findOne({ "user._id": user._id, service: "clickup" });
  if (integration) {
    return {
      id: call.id,
      name: call.name,
      result: "you are already connected to clickup",
    };
  }
  const clientId = process.env["CLICKUP_CLIENT_ID"];
  const redirectUri = process.env["BASE_URI"] + "/redirect/clickup";

  const uri = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${redirectUri}&state=${user.username}`;
  return {
    id: call.id,
    name: call.name,
    result: `please login from this link: ${uri}`,
  };
}

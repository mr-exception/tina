import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";

export async function handleSetTimezone(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  const { timezone } = call.parameters as { timezone: string };
  user.timezone = timezone;
  await user.save();
  return {
    name: call.name,
    id: call.id,
    result: `your timezone is now set to ${timezone}`,
  };
}

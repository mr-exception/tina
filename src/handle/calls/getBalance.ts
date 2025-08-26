import { ICallResponse } from "../../db/message";
import { UserDoc } from "../../db/user";
import { ModelCallResponse } from "../../specs/interaction";

export async function handleGetBalance(user: UserDoc, call: ModelCallResponse): Promise<ICallResponse> {
  return {
    name: call.name,
    id: call.id,
    result: `
user usage: ${user.usage.usage}, 
current credit: ${user.usage.credit},
hard limit: ${user.usage.usageHardLimit},
soft limit: ${user.usage.usageSoftLimit},
when user usage reaches soft limit, I send you an invoice for payment and after reaching the hard limit, we can't have interaction with you until you pay your bill.`,
  };
}

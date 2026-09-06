import { apiRequest } from "./api";

export type BotResponse = {
  success: boolean;
  reply?: string;
  message?: string;
};

export async function askKisanBot(
  message: string
): Promise<string> {
  const data = await apiRequest<BotResponse>(
    "/api/kisan-bot/chat",
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );

  if (!data.reply) {
    throw new Error(
      data.message || "KisanBot returned no response"
    );
  }

  return data.reply;
}

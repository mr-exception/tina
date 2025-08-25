export interface ITelegramUpdate {
  update_id: number;
  message: ITelegramMessage;
}

export interface ITelegramMessage {
  message_id: string;
  from: ITelegramUser;
  chat: ITelegramChat;
  date: string;
  text: string;
  entities: any;
}

export interface ITelegramUser {
  id: string;
  is_bot: boolean;
  first_name: string;
  username: string;
  language_code: string;
}

export interface ITelegramChat {
  id: string;
  first_name: string;
  username: string;
  type: string;
}

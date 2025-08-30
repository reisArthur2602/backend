export type User = {
  id: string;
  email: string;
  password: string;
};

export type Menu = {
  id: string;
  name: string;
  message: string;
  keywords: string[];
  config: MENU_CONFIG;
  options: Option[];
  active: boolean;
};

export type Option = {
  id: string;
  label: string;
  trigger: number;
  action: OPTION_ACTION;
  reply_text?: string;
  finish_text?: string;
  payload: string;
  menu_id: string;
};

export type MENU_CONFIG = {
  id: string;
  days: DAYS_SERVICE;
  menu_id: string;
  timeStart: string;
  timeEnd: string;
  default_Message_Out_Of_Time?: string;
  default_Message_Out_Of_Date?: string;
};

export type Instance = {
  id: string;
  connected: boolean;
  qrCode: string | null;
};

export enum DAYS_SERVICE {
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
}

export type Session = {
  id: string;
  customer_phone: string;
  customer_name: string;
  status: STATUS_SESSION;
  assignedTo: string;
  chat_id: string;
};

export type Chat = {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: CHATS_STATUS;
  messages: MessageLog[];
};

export type MessageLog = {
  id: string;
  chat_id: string;
  phone: string;
  text: string;
  from: MESSAGE_FROM;
  status: boolean;
};
export enum MESSAGE_FROM {
  "CUSTOMER",
  "AGENT",
  "MENU",
}
export enum OPTION_ACTION {
  "AUTO_REPLY",
  "REDIRECT_QUEUE",
  "END_SESSION",
}


export enum STATUS_SESSION {
  "IN_QUEUE",
  "ATTENDED",
  "CLOSED",
}

export enum CHATS_STATUS {
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
}

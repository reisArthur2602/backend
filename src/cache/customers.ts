export type CustomerState =
  | "idle"
  | "await_option"
  | "in_queue"
  | "in_service"
  | "finished";

export type Customer = {
  phone: string;
  name: string;
  state: CustomerState;
  messages?: MessageLog[];
  queue_id?: string;
};
export type MessageLog = {
  phone?: string;
  from: "customer" | "menu" | "agent";
  text: string;
  chat_id?: string;
};
export const customers: Map<string, Customer> = new Map();

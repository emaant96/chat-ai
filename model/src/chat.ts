

export interface AIMessage {
  text: string;
  role: 'user' | 'bot';
  src?: string;
}
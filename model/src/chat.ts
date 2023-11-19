

export interface AIMessage {
  text: string;
  role: 'user' | 'bot';
  src?: string;
  attachments?: Attachment[];
}

export type Attachment = {id:number; name:string, blob?:string, file:string}
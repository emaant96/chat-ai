

export interface AIMessage {
  text: string;
  role: 'user' | 'bot';
  src?: string;
  attachments?: Attachment[];
  audio?: Buffer;
}

export type StreamAIMessage = { text: string, first?: boolean, last?: boolean, src?: string, audio?: Buffer }


/**
 * Represents an attachment.
 *
 * @typedef {Object} Attachment
 * @property {number} id - The ID of the attachment.
 * @property {string} name - The name of the attachment.
 * @property {string} [blob] - The blob data of the attachment.
 * @property {string} file - The base64 of the attachment.
 */
export type Attachment = {id:number; name:string, blob?:string, file:string}
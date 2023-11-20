import {OpenAI} from "openai";

export interface OpenapiCompany {
  cf: string;
  denominazione: string;
  piva: string;
  toponimo: string;
  via: string;
  civico: string;
  indirizzo: string;
  comune: string;
  frazione: string;
  provincia: string;
  stato_attivita:
    | "ATTIVA"
    | "REGISTRATA"
    | "INATTIVA"
    | "SOSPESA"
    | "IN_ISCRIZIONE"
    | "CESSATA";
  timestamp: number;
  timestamp_creation: number;
  timestamp_last_update: number;
  cap: string;
  codice_destinatario: string;
  id: string;
  data_iscrizione: string;
}

export interface OpenapiCompanyAdvanced extends OpenapiCompany {
  dettaglio: {
    rea: string;
    cciaa: string;
    pec: string;
    codice_natura_giuridica: string;
    descrizione_ateco: string;
    codice_ateco: string;
    data_inizio_attivita: string;
    bilanci: {
      [k: string]: {
        data_chiusura_bilancio: string;
        fatturato: number;
        utile: number;
      };
    };
    cessata: false;
    soci: {
      denominazione: string;
      nome: string;
      cognome: string;
      cf_socio: string;
      quota: number;
    }[];
  };
}

export type OpenAiResponse<T> = { type: 'function', message: T, name:string } | { type: 'response', message: string }

export type OpenAiMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam

export type OpenAiChunk = OpenAI.Chat.Completions.ChatCompletionChunk

export type StreamAIMessage = { text: string, first?: boolean, last?: boolean, src?: string }

export type AiFunction = OpenAI.Chat.Completions.ChatCompletionCreateParams.Function

export type AiFunctionEnhanced = ({
  data: AiFunction,
  exec: ((...args: string[]) => any)
})
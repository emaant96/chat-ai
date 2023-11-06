import {OpenAI} from "openai";

export type MessageTokenized = {
  company_name: string,
  business_information: typeof businessInformation[number][]
}


export const businessInformation = ["bilancio", "pec", "indirizzo", "telefono", "email"] as const

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

export type OpenAiResponse<T> = { type: 'function', message: T } | {type: 'response', message: string}


export type OpenAiMessage = { role: "function" | "system" | "user" | "assistant", content: string, name?: string }

export type StreamAIMessage = { text: string, first?: boolean, last?: boolean }

export type AiFunction = OpenAI.Chat.Completions.ChatCompletionCreateParams.Function

export type AiFunctionEnhanced = Function & { func?: (data: any) => Promise<any> }
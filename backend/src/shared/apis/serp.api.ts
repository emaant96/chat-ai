import {getJson} from "serpapi";
import {globalConfig} from "../services/config.service";

export class SerpApi {

  private engine = "google"

  private params = (q:string) => ({engine: this.engine, q, api_key: this.apiKey})

  constructor(private apiKey: string) {
  }

  async q(query: string) {
    const res = await getJson(this.params(query), (json) => {
      console.log(json['organic_results'].map((result) => result['snippet']).join('\n'))
    })
    return res['organic_results']
  }

}

export const serp = new SerpApi(globalConfig.serp.apiKey)
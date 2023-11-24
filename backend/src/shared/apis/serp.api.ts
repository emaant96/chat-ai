import {EngineParameters, getJson} from "serpapi";
import {globalConfig} from "../services/config.service";

export class SerpApi {

  private engine = "google"

  private params = (q: string, topic?: string): EngineParameters => ({
    engine: this.engine,
    q,
    api_key: this.apiKey,
    tbm: topic
  })

  constructor(private apiKey: string) {
  }

  async q(query: string, topic?: string) {
    const res = await getJson(this.params(query, topic), (json) => {
      console.log(json['organic_results'])
    })
    return res['organic_results']
  }

  async news(query: string) {
    const res = await getJson(this.params(query, 'nws'), (json) => {
      console.log(json['news_results'])
    })
    return res['news_results']

  }

}

export const serp = new SerpApi(globalConfig.serp.apiKey)
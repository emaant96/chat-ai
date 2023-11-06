import {getJson} from "serpapi";

export class SerpApi {

  private engine = "google"

  private params = (q:string) => ({engine: this.engine, q, api_key: this.apiKey})

  constructor(private apiKey: string) {
  }

  q(query: string) {
    return getJson(this.params(query), (json) => {
      console.log(json['organic_results'])
    })
  }

}

class HttpService {
  constructor(private _baseUrl: string) {
  }


  async get(url: string) {
    return await this.makeRequest({method: 'GET', url: this._baseUrl + url});
  }

  async post(url: string, body: any) {
    return await this.makeRequest({method: 'POST', url: this._baseUrl + url, body});
  }

  async makeRequest(request: { method: 'GET' | 'POST'; headers?: any; body?; url: string }) {
    const options: any = {
      method: request.method,
      headers: {...request.headers}
    };

    options.body = JSON.stringify(request.body);
    options.headers['Content-Type'] = 'application/json';


    return await fetch(request.url, options).then(async (res) => await res.json().catch(() => res));
  }
}

export const http = new HttpService('http://localhost:3005/api');

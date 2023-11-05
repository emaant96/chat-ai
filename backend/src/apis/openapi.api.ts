import {globalConfig} from "../services/config";
import {OpenapiCompany, OpenapiCompanyAdvanced} from "../types";

export class OpenapiService {
  options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${globalConfig.openapi.token}`
    }
  };

  async getCompaniesByQuery(query: string) {
    const path = `/autocomplete/*${query}*`;
    const companies: { id: string; denominazione: string }[] = await this.get(path);
    console.log('companies: ', companies);
    return companies;
  }

  async getCompanyById(id: string) {
    const path = `/base/${id}`;
    const company: OpenapiCompany = await this.get(path);
    return company;
  }

  async getCompanyAdvancedById(id: string) {
    const path = `/advance/${id}`;
    const company: OpenapiCompanyAdvanced = await this.get(path);
    return company;
  }

  private async get(path: string) {
    const response = await fetch(globalConfig.openapi.url + path, this.options).then(
      async (res) => {
        if (res.status == 200) return await res.json();
        if (res.status == 204) return {data: []};
      }
    );
    return response.data;
  }
}

export const openApiService = new OpenapiService();
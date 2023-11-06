import {openapi} from "../shared/apis/openapi.api";
import {OpenapiCompanyAdvanced} from "../types";

export class AiService {

  companyResponses = {
    noCompany: `Non ho trovato nessuna azienda, riprova con un nome diverso`,
    someCompanies: (companies: string[]) => `ho trovato queste aziende: ${companies.join(', ')}, riprova con un nome più specifico`,
    manyCompanies: (companies: any[]) => `ho trovato ${companies.length} aziende, riprova con un nome più specifico`
  }

  async getCompanyInfo(companyName: string): Promise<{ success: false; content: string } | { success: true, content: OpenapiCompanyAdvanced }> {
    const companies = await openapi.getCompaniesByQuery(companyName)
    if (companies.length === 0) {
      return {success: false, content: this.companyResponses.noCompany}
    } else if (companies.length > 1 && companies.length < 10) {
      return {success: false, content: this.companyResponses.someCompanies(companies.map(company => company.denominazione))}
    } else if (companies.length > 10) {
      return {success: false, content: this.companyResponses.manyCompanies(companies)}
    } else if (companies.length === 1) {
      const company = await openapi.getCompanyAdvancedById(companies[0].id)
      console.dir({company}, {depth: 10})
      return {success: true, content: company}
    }
  }
}

export const ai = new AiService()
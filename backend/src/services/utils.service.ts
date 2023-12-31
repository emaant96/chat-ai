import {openapi} from "../shared/apis/openapi.api";
import {OpenapiCompanyAdvanced} from "../types";
import {serp} from "../shared/apis/serp.api";

export class UtilsService {

  companyResponses = {
    noCompany: `I didn't find any company, try again with a different name`,
    someCompanies: (companies: string[]) => `I found these companies: ${companies.join(', ')}, try again with a more specific name`,
    manyCompanies: (companies: any[]) => `I found ${companies.length} companies, Try again with a more specific name`
  }

  generateImage(imagePrompt: string) {
    return {success: true, content: imagePrompt}
  };

  async getCompanyInfo(companyName: string): UtilsReturn<OpenapiCompanyAdvanced> {
    const companies = await openapi.getCompaniesByQuery(companyName)
    if (companies.length === 0) {
      return {success: false, content: this.companyResponses.noCompany}
    } else if (companies.length > 1 && companies.length < 10) {
      return {
        success: false,
        content: this.companyResponses.someCompanies(companies.map(company => company.denominazione))
      }
    } else if (companies.length > 10) {
      return {success: false, content: this.companyResponses.manyCompanies(companies)}
    } else if (companies.length === 1) {
      const company = await openapi.getCompanyAdvancedById(companies[0].id)
      console.dir({company}, {depth: 10})
      return {success: true, content: company}
    }
  }

  async getHtmlUniqueSelector(selector: string): UtilsReturn<string> {
    return {success: false, content: selector}
  }

  async googleSearch(query: string): UtilsReturn<string> {
    console.log('1', {query})
    const search: { snippet: string, link: string }[] = await serp.q(query)
    return {
      success: true,
      content: search.map((result) => `text: ${result.snippet}, link: ${result.link};`).join('\n')
    }
  }

  async googleSearchWithTopic(query: string, topic: string): UtilsReturn<string> {
    console.log('2', {query, topic})
    const search: { snippet: string, link: string }[] = await serp.news(query)
    return {
      success: true,
      content: search.map((result) => `text: ${result.snippet}, link: ${result.link};`).join('\n')
    }
  }
}

export const utils = new UtilsService()

export type UtilsReturn<T> = Promise<{ success: false; content: string } | { success: true, content: T }>
import {AiFunction, businessInformation} from "../types";
import {openapi} from "../shared/apis/openapi.api";


const getInfoCompanyParameters = {
  type: "object",
  properties: {
    company_name: {
      type: "string",
      description: "The name of the company and 4 possible variations based on a standard company name",
    },
    business_information: {
      type: "array",
      description: "The essential business information to use for the search",
      items: {
        type: "string",
        enum: businessInformation
      },
    },
  },
  required: ["company_name"]

} as const

export const functions: ({ data: AiFunction, func: ((...args: keyof AiFunction['parameters']["properties"]) => any) })[] = [
  {
    data: {
      name: "getInfoCompany",
      description: "get the info about a company",
      parameters: getInfoCompanyParameters
    },
    func: getInfoCompany
  }
]


export async function getInfoCompany(company_name: string, business_information: typeof businessInformation[number][]) {
  const companies = await openapi.getCompaniesByQuery(company_name)
  if (companies.length === 0) {
    return `Non ho trovato nessuna azienda, riprova con un nome diverso`
  } else if (companies.length > 1) {
    return `ho trovato queste aziende: ${companies.map(company => company.denominazione).join(', ')}, riprova con un nome più specifico`
  } else if (companies.length === 1) {
    const company = await openapi.getCompanyById(companies[0].id)

  }
}
import {AiFunctionEnhanced, businessInformation} from "../types";
import {utils} from "./ai.service";


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

export const functions: AiFunctionEnhanced[] = [
  {
    data: {
      name: "getInfoCompany",
      description: "get the info about a company",
      parameters: getInfoCompanyParameters
    },
    func: utils.getCompanyInfo
  }
]
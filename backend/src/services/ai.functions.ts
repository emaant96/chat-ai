import {AiFunctionEnhanced} from "../types";
import {utils} from "./utils.service";


const getInfoCompanyParameters = {
  type: "object",
  properties: {
    company_name: {
      type: "string",
      description: "The name of the company and 4 possible variations based on a standard company name",
    },
    // business_information: {
    //   type: "array",
    //   description: "The essential business information to use for the search",
    //   items: {
    //     type: "string",
    //     enum: businessInformation
    //   },
    // },
  },
  required: ["company_name"]

} as const

const getHtmlUniqueSelector = {
  type: "object",
  properties: {
    selector: {
      type: "string",
      description: "The selector to use to get the information",
    },
  },
  required: ["selector"]
} as const

export const generateImage = {
  name: 'generate_image',
  description: 'Generates an image from a text prompt',
  parameters: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The text prompt to generate the image from'
      }
    },
    required: ['prompt']
  }
};

export const functions: AiFunctionEnhanced[] = [
  {
    data: {
      name: "getInfoCompany",
      description: "get the info about a company",
      parameters: getInfoCompanyParameters
    },
    exec: (args) => utils.getCompanyInfo(args)
  },
  {
    data: {
      name: "getHtmlUniqueSelector",
      description: "get the unique selector of an element given his textual description",
      parameters: getHtmlUniqueSelector
    },
    exec: (args) => utils.getHtmlUniqueSelector(args)
  },
  {
    data: {
      name: 'generateImage',
      description: 'Generates an image from a text prompt',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The text prompt to generate the image from'
          }
        },
        required: ['prompt']
      }
    },
    exec: (args) => utils.generateImage(args)
  }
]
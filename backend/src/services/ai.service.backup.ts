// import {AiFunction, businessInformation, MessageTokenized, PromptModel} from "../types";
// import {tokenizerTemplate} from "../templates";
// import {model} from "../apis/model.api";
// import {openApiService} from "../apis/openapi.api";
//
// let currentStep = 0
//
// let companies = []
//
// /*
//  steps:
//   1. ottenere il nome di un azienda
//   2. cercare singola azienda
//   3. ottenere info su azienda
//
//  */
//
// const messages: PromptModel[] = [
//   {
//     "role": "system",
//     content: tokenizerTemplate
//   },
//   {
//     "role": "user",
//     // content: "Cosa puoi fare?",
//     content: "Puoi darmi il bilancio e l'email per l'azienda Bazu? Inoltre mi serve anche la pec."
//   }
// ]
//
// import {Function, businessInformation} from "../types";
//
// const functions: Function[] = [
//   {
//     name: "get_info_company",
//     description: "get the info about a company",
//     parameters: {
//       type: "object",
//       properties: {
//         company_name: {
//           type: "string",
//           description: "The name of the company and 4 possible variations based on a standard company name",
//         },
//         business_information: {
//           type: "array",
//           description: "The essential business information to use for the search",
//           items: {
//             type: "string",
//             enum: businessInformation
//           },
//         },
//       },
//       required: ["company_name"]
//     },
//   }
// ]
//
// model.sendPrompt<MessageTokenized>(messages, functions).then(async response => {
//   console.dir({response})
//
//   if (response.type === 'error') {
//     //torna idle
//     return console.log(response.message)
//   } else if (response.type === 'response') {
//     //trovare una singola azienda
//     currentStep++
//
//     const {company_name, business_information} = response.message
//
//     companies = await openApiService.getCompaniesByQuery(company_name)
//
//     await useCompanies()
//   }
// })
//
// export async function useCompanies() {
//   console.log('companies', companies.length)
//
//   if (companies.length === 0) {
//     //torna idle
//     return console.log('Non ho trovato nessuna azienda, riprova con un nome diverso')
//   }
//
//   if (companies.length > 1) {
//     //torna idle
//
//     // questa parte sarà una funzione chiamata dal receiveMessage del socket che si troverà nello step 1
//     await handleTooManyCompanies()
//   }
//
//   if (companies.length === 1) {
//     const company = await openApiService.getCompanyById(companies[0].id)
//     console.dir({company})
//   }
// }
//
//
// export async function handleTooManyCompanies() {
//   console.log(`ho trovato queste aziende: ${companies.map(company => company.denominazione).join(', ')}, riprova con un nome più specifico`)
//
//   //socket response message from the user
//   let message = "Prova con Bazuel S.R.L."
//
//   const prompt: PromptModel = {"role": "user", content: message}
//
//   messages.push(prompt)
//
//   const response = await model.sendPrompt<MessageTokenized>(messages, functions)
//
//   if (response.type === 'error') {
//     //torna idle
//     return console.log(response.message)
//   } else if (response.type === 'response') {
//     companies = await openApiService.getCompaniesByQuery(response.message.company_name)
//     await useCompanies()
//   }
// }

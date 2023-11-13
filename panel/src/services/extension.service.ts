export class ExtensionService {

  async tabID() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
    return tab.id
  }
}


export const extension = new ExtensionService()
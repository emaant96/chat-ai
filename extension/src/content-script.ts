const buttonHTML = `
  <div class="float-button">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"/>
    </svg>
  </div>
`

const style = `
  .float-button {
    position: fixed;
    top: calc(50% - 75px);
    right: -25px;
    width: 50px;
    height: 50px;
    z-index: 9999;
    background: #8ab0fc;
    color: #fff;
    border: none;
    border-radius: 50% 0 0 50%; /* Mezzaluna */
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    font-size: 20px;
    font-weight: bolder;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,0.15);
    display: flex;
    text-align: center;
    align-items: center;
    padding-left: 2px;
  }
  
  .float-button:hover {
    right: 0;
    padding-left: 10px;
  }
  
  .float-button svg{
    color: #ffffff;
  }

  `

const styleElement = document.createElement('style')
styleElement.innerHTML = style

const button = new DOMParser().parseFromString(buttonHTML, 'text/html').body.firstChild as HTMLButtonElement

button.addEventListener('click', () => chrome.runtime.sendMessage({type: 'OPEN_PANEL'}))

document.head.appendChild(styleElement)
document.body.appendChild(button)
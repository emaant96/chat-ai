const buttonHTML = `
  <div class="float-button"><i class="arrow">></i></div>
`

const style = `
  .float-button {
    position: fixed;
    top: 50%;
    right: -25px;
    width: 50px;
    z-index: 9999;
    background: #4285f4;
    color: #fff;
    padding: 10px 20px 10px 10px;
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
  }
  
  .float-button:hover {
    right: 0;
    padding-left: 20px;
  }
  

  `

const styleElement = document.createElement('style')
styleElement.innerHTML = style

const button = new DOMParser().parseFromString(buttonHTML, 'text/html').body.firstChild as HTMLButtonElement

button.addEventListener('click', () => {
  chrome.runtime.sendMessage({type: 'OPEN_PANEL'});
})

document.head.appendChild(styleElement)
document.body.appendChild(button)
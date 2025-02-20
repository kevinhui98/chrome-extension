console.log("This is a popup!")

let OPENROUTER_API_KEY = localStorage.getItem('OPENROUTER_API_KEY') || "";
function setOpenRouterApiKey(key) {
    OPENROUTER_API_KEY = key;
    localStorage.setItem('OPENROUTER_API_KEY', key);
}
const keyStatus = document.createElement('div')
document.body.appendChild(keyStatus);
// API Key handling
const apiKeyInput = document.querySelector("#openrouter-api-key")
const saveKeyBtn = document.querySelector("#save-api-key")
saveKeyBtn.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim()
    setOpenRouterApiKey(newKey)
    console.log('your key is ' + newKey)
    // Check if there is a key that starts with 'sk-' in localStorage
    if (OPENROUTER_API_KEY.startsWith('sk-')) {
        keyStatus.innerHTML = 'You have a saved key';
    } else {
        keyStatus.innerHTML = `Your key doesn't start with sk-`
    }
    console.log(OPENROUTER_API_KEY)
})

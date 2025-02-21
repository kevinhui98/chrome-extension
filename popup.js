console.log("This is a popup!");

let OPENROUTER_API_KEY = localStorage.getItem('OPENROUTER_API_KEY') || "";

function setOpenRouterApiKey(key) {
    OPENROUTER_API_KEY = key;
    localStorage.setItem('OPENROUTER_API_KEY', key);
    // chrome.storage.local.set({ apiKey: key }, function () {
    //     console.log('API Key is saved to chrome.storage.local');
    // });
}

const keyStatus = document.createElement('div');
document.body.appendChild(keyStatus); // Ensure keyStatus is appended to the DOM

// API Key handling
const apiKeyInput = document.querySelector("#openrouter-api-key");
const saveKeyBtn = document.querySelector("#save-api-key");
saveKeyBtn.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim();
    setOpenRouterApiKey(newKey);
    console.log('your key is ' + newKey);
    keyStatus.innerHTML = `your key is ${newKey}`;
});

// Check if there is a key that starts with 'sk-' in localStorage
if (OPENROUTER_API_KEY.startsWith('sk-')) {
    keyStatus.innerHTML = `You have a saved key ${OPENROUTER_API_KEY}`;
    console.log(OPENROUTER_API_KEY);
}
const INLINE_SUGGESTION_DELAY = 1000;
let lastInlineRequest = null;
let suggestionBox = null;
let activeInput = null;
let userInput = ""
async function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
console.log("Current URL:", window.location.href.split('/')[2]);


async function fetchDataFromBackground(userInput) {
    let lastWord = userInput[userInput.length - 1]
    console.log(lastWord)
    if (lastWord != " ") {
        let inputList = userInput.split(" ")
        lastWord = inputList[inputList.length - 1]
    }
    console.log(lastWord)
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "fetchSuggestions", userInput: userInput, site: window.location.href, lastWord: lastWord }, (response) => {
            console.log('fetch', response)
            resolve(response);
        });
    });
}
chrome.runtime.sendMessage({ action: "wakeUp" }, (response) => {
    console.log("Message sent to Service Worker, response:", response);
});

function showInlineSuggestion(inputElement, suggestion) {
    removeSuggestion();
    console.log(suggestion.replace(inputElement.value, ""))
    const overlay = document.createElement("span");
    overlay.id = "inline-autocomplete";
    overlay.innerText = suggestion.replace(inputElement.value, ""); // Show only the remaining suggestion
    overlay.style.color = "gray";
    overlay.style.pointerEvents = "none";
    overlay.style.position = "absolute";

    // Positioning
    const rect = inputElement.getBoundingClientRect();
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
    const userText = inputElement.innerText || inputElement.value;
    overlay.style.paddingLeft = `${userText.length * 8}px`;
    console.log(overlay.style.left)
    document.body.appendChild(overlay);
}
document.addEventListener("input", async (event) => {
    console.log("Input event detected!", event.target)
    if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT" || event.target.tagName === "DIV" || event.target.isContentEditable) {
        const userText = event.target.innerText || event.target.value;
        console.log(userText)
        // Clear the previous timeout if it exists
        if (lastInlineRequest) {
            clearTimeout(lastInlineRequest);
        }
        // Set a new timeout
        lastInlineRequest = setTimeout(async () => {
            const suggestion = await fetchDataFromBackground(userText);
            console.log(suggestion)
            if (suggestion.res) {
                showInlineSuggestion(event.target, suggestion.res);
            }
        }, INLINE_SUGGESTION_DELAY);
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        const inputElement = document.activeElement;
        const overlay = document.getElementById("inline-autocomplete");
        console.log(overlay.innerText)
        if (overlay && inputElement) {
            event.preventDefault(); // Prevent default tabbing only if we have a suggestion
            acceptSuggestion(inputElement);
        }
    } else if (event.key === "Escape") {
        removeSuggestion();
    }
});

// function readDocumentContent() {
//     //  Important:  Identifying the correct element containing the document text
//     //  can be tricky in Google Docs.  You'll likely need to inspect the page's HTML
//     //  using your browser's developer tools (right-click on the document, "Inspect")
//     //  to find the appropriate selector.

//     //  Example selectors (these might need adjustment based on Google Docs updates):
//     const docBodyElement = document.querySelector('.kix-appview-editor'); //  Try this general selector
//     const metaTag = document.querySelector('meta[property="og:description"]').content
//     console.log(metaTag)
//     if (docBodyElement) {
//         const textContent = docBodyElement.textContent; // Or .innerText (try both)
//         console.log("Document Content:", textContent);
//         alert("Document Content in Console (Check DevTools Console)"); // For simple feedback

//         //  You can now do something with this textContent, like send it to your background script
//         //  or display it in your extension's popup.
//     } else {
//         console.error("Could not find document body element.");
//         alert("Could not find document text. Inspect the page and update the selector in content.js.");
//     }
// }
// // Example:  Trigger reading content when the extension icon in the toolbar is clicked (if you have a popup)
// readDocumentContent();
// window.addEventListener('load', () => {
//     const docBodyElement = document.querySelector('.kix-appview-editor');
//     if (docBodyElement) {
//         const textContent = docBodyElement.textContent; // Or .innerText (try both)
//         console.log("Document Content:", textContent);
//         alert("Document Content in Console (Check DevTools Console)"); // For simple feedback

//         //  You can now do something with this textContent, like send it to your background script
//         //  or display it in your extension's popup.
//     } else {
//         console.error("Could not find document body element.");
//         alert("Could not find document text. Inspect the page and update the selector in content.js.");
//     }
// });

document.addEventListener("focus", (event) => {
    console.log("Focused on element:", event.target);

}, true);

function removeSuggestion() {
    const existingOverlay = document.getElementById("inline-autocomplete");
    if (existingOverlay) existingOverlay.remove();
}

function acceptSuggestion(inputElement) {
    const overlay = document.getElementById("inline-autocomplete");
    if (overlay) {
        // inputElement.innerText = inputElement.value + overlay.innerText;// Append suggestion
        inputElement.value += overlay.innerText;
        removeSuggestion();
    }
}

function showInlineSuggestionContentEditable(editableDiv, suggestion) {
    // Remove previous suggestion
    const existingSuggestion = editableDiv.querySelector(".inline-suggestion");
    if (existingSuggestion) existingSuggestion.remove();

    // Create grayed-out suggestion span
    const suggestionSpan = document.createElement("span");
    suggestionSpan.className = "inline-suggestion";
    suggestionSpan.innerText = suggestion;
    suggestionSpan.style.color = "gray";
    suggestionSpan.style.opacity = "0.6";

    // Append it inline after current text
    editableDiv.appendChild(suggestionSpan);
}
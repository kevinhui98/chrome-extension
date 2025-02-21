const INLINE_SUGGESTION_DELAY = 2000;
let lastInlineRequest = null;
let suggestionBox = null;
let activeInput = null;

const OPENROUTER_API_KEY = "";
// const OPENROUTER_API_KEY = "";
const GROQ_API_KEY = ""
// llama-3.1-8b-instant
console.log(GROQ_API_KEY)
async function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
// Debounce suggestions
if (lastInlineRequest) {
    clearTimeout(lastInlineRequest);
}

async function fetchSuggestions(text) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                messages: [
                    {
                        role: "system",
                        content: `You are an inline code completion assistant. Return ONLY a SINGLE completion item containing:
                                  - text: The suggested completion text
                                  
                                  The completion should:
                                  1. Be a natural continuation of the current code
                                  2. Be contextually relevant
                                  3. Complete the current line or add a new line if appropriate
                                  4. Be mindful of the punctuation 
                                  
                                  Keep suggestions concise and relevant.`,
                    },
                    {
                        role: "user",
                        content: `Current text: "${text}"`,
                    },
                ],
            }),
        });
        const data = await response.json();
        console.log(data)
        console.log(data.choices[0].message.content)
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Autocomplete error openrouter:", error);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: `You are an inline code completion assistant. given the following user trying into a textfield, take the context so far, and predict until the end of the sentence, just give me the rest of the completion:

            Keep suggestions concise and relevant.`,
                    },
                    {
                        role: "user",
                        content: `Current text: "${text}"`,
                    },
                ],
            }),
        });
        const data = await response.json();
        console.log(data)
        console.log(data.choices[0].message.content)
        // const suggestion = JSON.parse(data.choices[0].message.content)[0];
        return data.choices[0].message.content || "";
    }
}

function showInlineSuggestion(inputElement, suggestion) {
    removeSuggestion();
    console.log(suggestion.replace(inputElement.value, ""))
    const overlay = document.createElement("span");
    overlay.id = "inline-autocomplete";
    overlay.innerHTML = suggestion.replace(inputElement.value, ""); // Show only the remaining suggestion
    overlay.style.color = "gray";
    overlay.style.pointerEvents = "none";
    overlay.style.position = "absolute";

    // Positioning
    const rect = inputElement.getBoundingClientRect();
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.paddingLeft = `${inputElement.value.length * 8}px`;
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
            const suggestion = await fetchSuggestions(userText);
            console.log(suggestion);
            if (suggestion) {
                showInlineSuggestion(event.target, suggestion);
            }
        }, INLINE_SUGGESTION_DELAY);
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        const inputElement = document.activeElement;
        const overlay = document.getElementById("inline-autocomplete");

        if (overlay && inputElement) {
            event.preventDefault(); // Prevent default tabbing only if we have a suggestion
            acceptSuggestion(inputElement);
        }
    } else if (event.key === "Escape") {
        removeSuggestion();
    }
});
// window.addEventListener('load', () => {
//     // Wait for the iframe to be loaded
//     const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');

//     if (iframe) {
//         // If iframe src is about:blank, check if it gets replaced with an actual document
//         iframe.addEventListener('load', () => {
//             const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

//             if (iframeDoc) {
//                 console.log("Iframe content loaded, setting up MutationObserver.");

//                 // Set up MutationObserver to monitor changes within the iframe
//                 const observer = new MutationObserver(mutationsList => {
//                     mutationsList.forEach(mutation => {
//                         if (mutation.type === "childList") {
//                             mutation.addedNodes.forEach(node => {
//                                 if (node.tagName === "DIV" && node.isContentEditable) {
//                                     console.log("New contenteditable div added in iframe:", node);
//                                 }
//                             });
//                         }
//                     });
//                 });

//                 // Observe changes within the iframe body
//                 observer.observe(iframeDoc.body, {
//                     childList: true,
//                     subtree: true,
//                 });
//             } else {
//                 console.error("Unable to access iframe content.");
//             }
//         });
//     } else {
//         console.error("Iframe element not found.");
//     }
// });

// document.addEventListener("focus", (event) => {
//     console.log("Focused on element:", event.target);

// }, true);

function removeSuggestion() {
    const existingOverlay = document.getElementById("inline-autocomplete");
    if (existingOverlay) existingOverlay.remove();
}

function acceptSuggestion(inputElement) {
    const overlay = document.getElementById("inline-autocomplete");
    if (overlay) {
        inputElement.value += overlay.innerText; // Append suggestion
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
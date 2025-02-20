const INLINE_SUGGESTION_DELAY = 800;
let suggestionBox = null;
let activeInput = null;
const API_KEY = "";

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}


async function fetchSuggestions(text) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
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
        // const suggestion = JSON.parse(data.choices[0].message.content)[0];
        return data.choices[0].message.content || "";
    } catch (error) {
        console.error("Autocomplete error:", error);
        return "";
    }
}

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
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.paddingLeft = `${inputElement.value.length * 8}px`;
    console.log(overlay.style.left)
    document.body.appendChild(overlay);
}
document.addEventListener("input", async (event) => {
    if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT" || event.target.tagName === "CANVAS") {
        const userText = target.value;
        const suggestion = await fetchSuggestions(userText);

        if (suggestion) {
            showInlineSuggestion(target, suggestion);
        }
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
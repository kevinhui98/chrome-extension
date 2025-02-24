importScripts('config.js');
console.log("Background script is running!");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // // Ensure the request comes from a trusted source
    if (!sender.origin || !sender.tab || sender.tab.url.startsWith("chrome://")) {
        console.warn("Untrusted sender", sender);
        sendResponse({ success: false, error: "Unauthorized request" });
        return;
    }
    console.log("bg message ", message);
    (async () => {
        console.log('in async')
        if (message.action === "fetchSuggestions") {
            console.log('in if')
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                        messages: [
                            {
                                role: "system",
                                content: `You are an inline sentence auto completion assistant. given the following user trying into a textfield, take the context so far, and predict until the end of the sentence, just give me the rest of the completion:
                                        The completion should:
                                        1. Be contextually relevant
                                        2. Be mindful of the punctuation 
                                        
                                        Keep suggestions concise and relevant.`,
                            },
                            {
                                role: "user",
                                content: `Current text: "${message.userInput}"`,
                            },
                        ],
                    }),
                })
                const data = await response.json();
                console.log(data)
                const res = data.choices[0].message.content
                sendResponse({ success: true, res });
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
                                content: `You are an inline sentence auto completion assistant. given the following user trying into a textfield, take the context so far, and predict until the end of the sentence, just give me the rest of the completion:

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
                console.log(data.choices[0].message.content)
                const res = data.choices[0].message.content
                sendResponse({ success: true, res });
            }
        }
    })();
    return true; // Keep the response channel open
});
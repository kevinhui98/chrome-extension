import CONFIG from "./config.js";

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "fetchSuggestions") {
        await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
                        content: `Current text: "${message.text}"`,
                    },
                ],
            }),
        })
            .then(response => response.json())
            .then(data => data.choices[0].message.content)
            .then(str => sendResponse({ success: true, str }))
            .catch(error => sendResponse({ success: false, error }))
            .then()
        return true; // Keep the response channel open
    }
});
// async function fetchSuggestions(text) {
//     try {
//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: "google/gemini-2.0-flash-lite-preview-02-05:free",
//                 messages: [
//                     {
//                         role: "system",
//                         content: `You are an inline code completion assistant. Return ONLY a SINGLE completion item containing:
//                                   - text: The suggested completion text
                                  
//                                   The completion should:
//                                   1. Be a natural continuation of the current code
//                                   2. Be contextually relevant
//                                   3. Complete the current line or add a new line if appropriate
//                                   4. Be mindful of the punctuation 
                                  
//                                   Keep suggestions concise and relevant.`,
//                     },
//                     {
//                         role: "user",
//                         content: `Current text: "${text}"`,
//                     },
//                 ],
//             }),
//         });
//         const data = await response.json();
//         console.log(data)
//         console.log(data.choices[0].message.content)
//         return data.choices[0].message.content;
//     } catch (error) {
//         console.error("Autocomplete error openrouter:", error);
//         const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${GROQ_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: "llama-3.1-8b-instant",
//                 messages: [
//                     {
//                         role: "system",
//                         content: `You are an inline code completion assistant. given the following user trying into a textfield, take the context so far, and predict until the end of the sentence, just give me the rest of the completion:

//             Keep suggestions concise and relevant.`,
//                     },
//                     {
//                         role: "user",
//                         content: `Current text: "${text}"`,
//                     },
//                 ],
//             }),
//         });
//         const data = await response.json();
//         console.log(data)
//         console.log(data.choices[0].message.content)
//         // const suggestion = JSON.parse(data.choices[0].message.content)[0];
//         return data.choices[0].message.content || "";
//     }
// }
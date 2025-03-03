importScripts('config.js');
console.log("Background script is running!");

// async function getAuthToken() {
//     return new Promise((resolve, reject) => {
//         chrome.identity.getAuthToken({ interactive: true }, (token) => {
//             if (chrome.runtime.lastError) {
//                 reject(chrome.runtime.lastError);
//                 return;
//             }
//             resolve(token);
//         });
//     });
// }
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // // Ensure the request comes from a trusted source
    // if (!sender.origin || !sender.tab || sender.tab.url.startsWith("chrome://")) {
    //     console.warn("Untrusted sender", sender);
    //     sendResponse({ success: false, error: "Unauthorized request" });
    //     return;
    // }
    // if (message.action === 'authenticate') {
    // gapi.load('client:auth2', initClient);
    // Example of getting the auth token

    // }

    // function initClient() {
    //     gapi.client.init({
    //         apiKey: CONFIG.GOOGLE_DOC_API_KEY, // Replace with your API key
    //         clientId: CONFIG.GOOGLE_DOC_CLIENT_ID, // Replace with your OAuth 2.0 Client ID
    //         scope: 'https://www.googleapis.com/auth/documents',
    //         discoveryDocs: ["https://docs.googleapis.com/$discovery/rest?version=v1"]
    //     }).then(() => {
    //         console.log("Client initialized");

    //         // Check if the user is signed in
    //         if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    //             // User is already signed in, so you can call the API
    //             loadDoc();
    //         } else {
    //             // If not signed in, ask the user to sign in
    //             gapi.auth2.getAuthInstance().signIn().then(() => {
    //                 console.log("User signed in");
    //                 loadDoc(); // After sign-in, call the document
    //             });
    //         }
    //     }).catch((error) => {
    //         console.error("Error initializing client:", error);
    //     });
    // }

    // function loadDoc() {
    //     // Example of loading and interacting with a Google Docs document
    //     const docId = 'your-google-doc-id'; // Replace with actual doc ID

    //     gapi.client.docs.documents.get({
    //         documentId: docId
    //     }).then((response) => {
    //         console.log("Document loaded:", response);
    //         // Further document manipulation logic can go here
    //     }).catch((error) => {
    //         console.error("Error loading document:", error);
    //     });
    // }

    // function modifyText(docId, startIndex, endIndex, newText) {
    //     const request = gapi.client.docs.documents.batchUpdate({
    //         documentId: docId,
    //         requests: [
    //             {
    //                 replaceAllText: {
    //                     containsText: {
    //                         text: 'oldText', // Text to find and replace
    //                         matchCase: true,
    //                     },
    //                     replaceText: newText, // New text to replace the old text
    //                 },
    //             },
    //         ],
    //     });

    //     request.execute((response) => {
    //         if (response.error) {
    //             console.error('Error modifying text:', response.error);
    //         } else {
    //             console.log('Text modified successfully');
    //         }
    //     });
    // }

    console.log('in async')
    if (message.action === "fetchSuggestions") {
        (async () => {
            console.log('user Input ', message.userInput)
            let prompt = [
                {
                    role: "system",
                    content: `you are an AI assistant embedded in a Chrome extension, designed to provide intelligent autocomplete suggestions based on user input and website context. Your goal is to enhance user productivity by generating relevant and context-aware text predictions.

                    Your Tasks:
                    Monitor User Input:

                    Read the text the user is typing in real time.
                    Predict the next words or phrases based on context and common patterns.
                    Analyze Website Context:

                    Read the current webpage URL.
                    Determine if the website belongs to a common category (e.g., social media, e-commerce, documentation, forums, email, search engines).

                    Generate Intelligent Predictions:

                    The user will also provide the last word that was written, if the word is a full word or it includes punctuations like (. , / ! ? ; :) begin the response with a space, if the word is a space or an incomplete word don't begin with a space.
                    
                    Maintain Privacy & Relevance:
                    Only process user input locally without storing or sending data externally.
                    Ensure suggestions are concise, non-intrusive, and improve efficiency without overwhelming the user.
                    Your goal is to create a seamless, intuitive, and intelligent autocomplete experience that adapts to different website environments. Your response should only consist of the sentence completion do not add any punctuations to the`,
                },
                {
                    role: "user",
                    content: `User input is "${message.userInput}"
                    website domain: ${message.site.split('/')[2]} 
                    website: ${message.site} 
                            last word of User's input is ${message.lastWord}`,
                },
            ]
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.0-flash-lite-preview-02-05:free",
                        messages: prompt,
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
                        Authorization: `Bearer ${CONFIG.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: prompt,
                    }),
                });
                const data = await response.json();
                console.log(data.choices[0].message.content)
                const res = data.choices[0].message.content
                sendResponse({ success: true, res });
            }
        })();
    }
    return true; // Keep the response channel open
});
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
                                content: `You are an inline sentence auto completion assistant. given the following user typing into a textfield, take the context so far, and predict until the end of the sentence, just give me the rest of the completion, Be contextually relevant, Be mindful of the punctuation, Keep suggestions concise and relevant.`,
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
        })();
    }
    return true; // Keep the response channel open
});
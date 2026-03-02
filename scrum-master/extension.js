// const vscode = require('vscode');
// const axios = require('axios'); // We added Axios to handle the API request

// function activate(context) {
//     console.log('ScrumMaster extension is now active!');

//     let disposable = vscode.commands.registerCommand('scrum-master.createTicket', async function () {
        
//         // 1. Prompt for Intent
//         const userIntent = await vscode.window.showInputBox({
//             prompt: "Describe the bug, feature, or task...",
//             placeHolder: "e.g., Fix the authentication timeout",
//             ignoreFocusOut: true 
//         });

//         if (!userIntent) {
//             return; // Silently exit if cancelled
//         }

//         // 2. Harvest Context (Phase 2 logic)
//         let codeContext = "";
//         let fileName = "No active file";
//         let language = "unknown";
//         const editor = vscode.window.activeTextEditor;

//         if (editor) {
//             fileName = editor.document.fileName.split(/[/\\]/).pop(); 
//             language = editor.document.languageId;
//             const selection = editor.selection;

//             if (!selection.isEmpty) {
//                 codeContext = editor.document.getText(selection);
//             } else {
//                 codeContext = editor.document.getText();
//                 if (codeContext.length > 5000) {
//                     codeContext = codeContext.substring(0, 5000) + "\n...[CODE TRUNCATED]";
//                 }
//             }
//         }

//         const apiPayload = {
//             intent: userIntent,
//             fileName: fileName,
//             language: language,
//             codeContext: codeContext
//         };

//         console.log("Payload ready:", apiPayload);

//         // --- PHASE 3: THE API CALL & UX ---
        
//         // This is where Dev 2 will paste the AWS API Gateway URL tomorrow
//         const AWS_ENDPOINT = "https://your-aws-api-gateway-url.com/create-ticket"; 
        
//         // Set this to TRUE right now so we can test without AWS. 
//         // Set to FALSE tomorrow when AWS is ready.
//         const IS_MOCK_MODE = true; 

//         // 3. Trigger the VS Code Loading Spinner
//         vscode.window.withProgress({
//             location: vscode.ProgressLocation.Notification,
//             title: "ScrumMaster AI",
//             cancellable: false
//         }, async (progress) => {
            
//             progress.report({ message: "Drafting Jira ticket..." });

//             try {
//                 let ticketUrl = "";

//                 if (IS_MOCK_MODE) {
//                     // Simulate a 3-second delay to mimic the AI thinking
//                     await new Promise(resolve => setTimeout(resolve, 3000));
//                     ticketUrl = "https://your-domain.atlassian.net/browse/SCRUM-123"; 
//                 } else {
//                     // The REAL API Call to AWS
//                     const response = await axios.post(AWS_ENDPOINT, apiPayload);
//                     // We assume Dev 2's Lambda returns the Jira URL in the response data
//                     ticketUrl = response.data.ticketUrl; 
//                 }

//                 // 4. Success UI with Action Button
//                 // We don't just tell them it worked; we give them a button to open it immediately.
//                 const userAction = await vscode.window.showInformationMessage(
//                     `✅ Ticket drafted and sent to Scrum Master review!`,
//                     "Open in Jira"
//                 );

//                 // If they click the button, open their web browser directly to the ticket
//                 if (userAction === "Open in Jira") {
//                     vscode.env.openExternal(vscode.Uri.parse(ticketUrl));
//                 }

//             } catch (error) {
//                 console.error("API Error:", error);
//                 vscode.window.showErrorMessage(`ScrumMaster Error: Failed to connect to AI engine. Check AWS connection.`);
//             }
//         });
//     });

//     context.subscriptions.push(disposable);
// }

// function deactivate() {}

// module.exports = { activate, deactivate }

































// const vscode = require('vscode');
// const axios = require('axios'); 

// function activate(context) {
//     console.log('ScrumMaster extension is now active!');

//     let disposable = vscode.commands.registerCommand('scrum-master.openUI', function () {
//         // 1. Create and show a new Webview Panel
//         const panel = vscode.window.createWebviewPanel(
//             'scrumMasterUI', // Internal ID
//             'BharatSprint AI', // Title of the panel
//             vscode.ViewColumn.Beside, // Opens in a split screen next to their code!
//             {
//                 enableScripts: true // Crucial: Allows our HTML button to run JavaScript
//             }
//         );

//         // 2. Inject the HTML/CSS into the panel
//         panel.webview.html = getWebviewContent();

//         // 3. Listen for messages coming from the HTML UI
//         panel.webview.onDidReceiveMessage(
//             async (message) => {
//                 switch (message.command) {
//                     case 'draftTicket':
//                         await handleDraftTicket(message.intent, panel.webview);
//                         return;
//                 }
//             },
//             undefined,
//             context.subscriptions
//         );
//     });

//     context.subscriptions.push(disposable);
// }

// // --- THE CORE LOGIC (Moved out of the UI for cleanliness) ---
// async function handleDraftTicket(userIntent, webview) {
//     let codeContext = "";
//     let fileName = "No active file";
//     let language = "unknown";
    
//     // Grab the editor that was active BEFORE they clicked the Webview
//     const editor = vscode.window.visibleTextEditors.find(e => e !== vscode.window.activeTextEditor) 
//                    || vscode.window.activeTextEditor;

//     if (editor) {
//         fileName = editor.document.fileName.split(/[/\\]/).pop(); 
//         language = editor.document.languageId;
//         const selection = editor.selection;

//         if (!selection.isEmpty) {
//             codeContext = editor.document.getText(selection);
//         } else {
//             codeContext = editor.document.getText();
//             if (codeContext.length > 5000) {
//                 codeContext = codeContext.substring(0, 5000) + "\n...[CODE TRUNCATED]";
//             }
//         }
//     }

//     const apiPayload = { intent: userIntent, fileName, language, codeContext };
//     console.log("Payload ready for AWS:", apiPayload);

//     // Tell the UI to show the loading spinner
//     webview.postMessage({ command: 'setLoading' });

//     const AWS_ENDPOINT = "https://your-aws-api-gateway-url.com/create-ticket"; 
//     const IS_MOCK_MODE = true; 

//     try {
//         let ticketUrl = "";

//         if (IS_MOCK_MODE) {
//             await new Promise(resolve => setTimeout(resolve, 3000));
//             ticketUrl = "https://your-domain.atlassian.net/browse/SCRUM-123"; 
//         } else {
//             const response = await axios.post(AWS_ENDPOINT, apiPayload);
//             ticketUrl = response.data.ticketUrl; 
//         }

//         // Tell the UI we succeeded and give it the URL
//         webview.postMessage({ command: 'setSuccess', url: ticketUrl });

//     } catch (error) {
//         console.error("API Error:", error);
//         // Tell the UI we failed
//         webview.postMessage({ command: 'setError' });
//     }
// }

// // --- THE FRONTEND UI (HTML/CSS) ---
// function getWebviewContent() {
//     return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>BharatSprint AI</title>
//         <style>
//             /* We use VS Code native CSS variables so it matches the user's theme perfectly */
//             body {
//                 font-family: var(--vscode-font-family);
//                 padding: 20px;
//                 color: var(--vscode-editor-foreground);
//                 background-color: var(--vscode-editor-background);
//                 display: flex;
//                 flex-direction: column;
//                 gap: 15px;
//             }
//             h2 {
//                 margin-top: 0;
//                 color: var(--vscode-textPreformat-foreground);
//                 font-weight: 600;
//             }
//             .subtitle {
//                 font-size: 13px;
//                 opacity: 0.8;
//                 margin-bottom: 10px;
//             }
//             textarea {
//                 width: 100%;
//                 box-sizing: border-box;
//                 background-color: var(--vscode-input-background);
//                 color: var(--vscode-input-foreground);
//                 border: 1px solid var(--vscode-input-border);
//                 padding: 10px;
//                 font-family: var(--vscode-font-family);
//                 border-radius: 4px;
//                 resize: vertical;
//                 outline: none;
//             }
//             textarea:focus {
//                 border-color: var(--vscode-focusBorder);
//             }
//             button {
//                 background-color: var(--vscode-button-background);
//                 color: var(--vscode-button-foreground);
//                 border: none;
//                 padding: 10px 14px;
//                 font-size: 14px;
//                 cursor: pointer;
//                 border-radius: 4px;
//                 font-weight: bold;
//                 transition: background-color 0.2s;
//             }
//             button:hover {
//                 background-color: var(--vscode-button-hoverBackground);
//             }
//             button:disabled {
//                 opacity: 0.5;
//                 cursor: not-allowed;
//             }
//             .status-card {
//                 display: none;
//                 padding: 15px;
//                 border-radius: 6px;
//                 margin-top: 10px;
//                 border: 1px solid var(--vscode-widget-border);
//                 background-color: var(--vscode-editorWidget-background);
//             }
//             .loader {
//                 display: inline-block;
//                 width: 16px;
//                 height: 16px;
//                 border: 2px solid var(--vscode-button-foreground);
//                 border-bottom-color: transparent;
//                 border-radius: 50%;
//                 animation: rotation 1s linear infinite;
//                 vertical-align: middle;
//                 margin-right: 8px;
//             }
//             @keyframes rotation {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(360deg); }
//             }
//         </style>
//     </head>
//     <body>
//         <h2>⚡ BharatSprint AI</h2>
//         <div class="subtitle">Your context (active file/highlighted code) will be automatically attached to this request.</div>
        
//         <textarea id="intentInput" rows="5" placeholder="Describe the task, bug, or feature... (e.g., Fix the auth timeout)"></textarea>
        
//         <button id="draftBtn" onclick="sendIntent()">Draft Jira Ticket</button>

//         <div id="statusArea" class="status-card">
//             <span id="statusIcon"></span>
//             <span id="statusText"></span>
//             <br><br>
//             <button id="openJiraBtn" style="display: none; background-color: #0052CC; color: white;">Open in Jira</button>
//         </div>

//         <script>
//             const vscode = acquireVsCodeApi(); // Connects UI to the Extension backend

//             function sendIntent() {
//                 const intent = document.getElementById('intentInput').value;
//                 if (!intent) return;
                
//                 // Send message to extension.js
//                 vscode.postMessage({
//                     command: 'draftTicket',
//                     intent: intent
//                 });
//             }

//             // Listen for messages coming BACK from extension.js
//             window.addEventListener('message', event => {
//                 const message = event.data;
//                 const statusArea = document.getElementById('statusArea');
//                 const statusText = document.getElementById('statusText');
//                 const statusIcon = document.getElementById('statusIcon');
//                 const btn = document.getElementById('draftBtn');
//                 const jiraBtn = document.getElementById('openJiraBtn');

//                 if (message.command === 'setLoading') {
//                     btn.disabled = true;
//                     btn.innerText = "Drafting...";
//                     statusArea.style.display = 'block';
//                     statusIcon.innerHTML = '<span class="loader"></span>';
//                     statusText.innerText = "AI is analyzing code & writing ticket...";
//                     jiraBtn.style.display = 'none';
//                 } 
//                 else if (message.command === 'setSuccess') {
//                     btn.disabled = false;
//                     btn.innerText = "Draft Another Ticket";
//                     document.getElementById('intentInput').value = ''; // Clear input
//                     statusIcon.innerHTML = '✅ ';
//                     statusText.innerText = "Ticket successfully drafted and sent to Scrum Master review!";
                    
//                     jiraBtn.style.display = 'inline-block';
//                     jiraBtn.onclick = () => window.open(message.url, '_blank');
//                 }
//                 else if (message.command === 'setError') {
//                     btn.disabled = false;
//                     btn.innerText = "Draft Jira Ticket";
//                     statusIcon.innerHTML = '❌ ';
//                     statusText.innerText = "Failed to generate ticket. Check AWS connection.";
//                 }
//             });
//         </script>
//     </body>
//     </html>`;
// }

// function deactivate() {}
// module.exports = { activate, deactivate }


















































const vscode = require('vscode');
const axios = require('axios');

function activate(context) {
    console.log('ScrumMaster Sidebar is now active!');

    // Register the Sidebar Provider using your exact identifier
    const provider = new ScrumMasterSidebarProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('scrum-master.sidebar', provider)
    );
}

class ScrumMasterSidebarProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };

        // Inject the HTML UI
        webviewView.webview.html = this._getHtmlForWebview();

        // Listen for messages from the UI
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'draftTicket':
                    await this.handleDraftTicket(data.intent);
                    break;
                case 'aiAutoFill':
                    this.handleAutoFillContext();
                    break;
            }
        });
    }

    handleAutoFillContext() {
        // Feature 1: AI Generated / Manual Task Description
        const editor = vscode.window.activeTextEditor;
        let text = "";
        
        if (editor && !editor.selection.isEmpty) {
            text = "Context from selected code:\n" + editor.document.getText(editor.selection);
        } else if (editor) {
            text = "Context from active file: " + editor.document.fileName.split(/[/\\]/).pop();
        } else {
            text = "No active code found. Please describe the task manually.";
        }
        
        // Send the extracted code back to the HTML textarea
        this._view.webview.postMessage({ type: 'fillInput', value: text });
    }

    async handleDraftTicket(userIntent) {
        // Feature 2: Create a Ticket (Trigger Loading UI)
        this._view.webview.postMessage({ type: 'setLoading' });

        const apiPayload = { intent: userIntent };
        
        // AWS variables for Phase 4
        const AWS_ENDPOINT = "https://your-aws-api-gateway-url.com/create-ticket"; 
        const IS_MOCK_MODE = true; 

        try {
            let ticketUrl = "";
            if (IS_MOCK_MODE) {
                // Simulating the AI processing delay
                await new Promise(resolve => setTimeout(resolve, 2500));
                ticketUrl = "https://your-domain.atlassian.net/browse/SCRUM-123"; 
            } else {
                const response = await axios.post(AWS_ENDPOINT, apiPayload);
                ticketUrl = response.data.ticketUrl; 
            }

            // Feature 3: Open in Jira (Send success and URL to UI)
            this._view.webview.postMessage({ type: 'setSuccess', url: ticketUrl });
        } catch (error) {
            this._view.webview.postMessage({ type: 'setError' });
        }
    }

    _getHtmlForWebview() {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                /* Using VS Code native variables for a seamless dark/light mode theme */
                body {
                    font-family: var(--vscode-font-family);
                    padding: 10px;
                    color: var(--vscode-editor-foreground);
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                h3 { margin: 0; padding-bottom: 8px; border-bottom: 1px solid var(--vscode-widget-border); }
                .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; opacity: 0.8;}
                
                textarea {
                    width: 100%; box-sizing: border-box; background: var(--vscode-input-background);
                    color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border);
                    padding: 8px; border-radius: 4px; resize: vertical; outline: none; min-height: 100px;
                    font-family: var(--vscode-editor-font-family); font-size: 13px;
                }
                textarea:focus { border-color: var(--vscode-focusBorder); }
                
                button {
                    width: 100%; background: var(--vscode-button-background); color: var(--vscode-button-foreground);
                    border: none; padding: 10px; cursor: pointer; border-radius: 4px; font-weight: bold;
                }
                button:hover { background: var(--vscode-button-hoverBackground); }
                button:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .secondary-btn { background: var(--vscode-secondaryButton-background); color: var(--vscode-secondaryButton-foreground); margin-bottom: 8px; font-weight: normal;}
                .secondary-btn:hover { background: var(--vscode-secondaryButton-hoverBackground); }
                
                .jira-btn { background-color: #0052CC; color: white; display: none; margin-top: 10px;}
                .jira-btn:hover { background-color: #0065FF; }
                
                #statusArea { display: none; padding: 12px; border-radius: 4px; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-widget-border); font-size: 13px; text-align: center;}
                
                .loader { display: inline-block; width: 14px; height: 14px; border: 2px solid var(--vscode-button-foreground); border-bottom-color: transparent; border-radius: 50%; animation: rotation 1s linear infinite; vertical-align: middle; margin-right: 6px;}
                @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h3>⚡ ScrumMaster AI</h3>
            
            <div>
                <span class="section-title">1. Task Context</span>
                <button class="secondary-btn" onclick="aiAutoFill()">✨ Extract from Active Code</button>
                <textarea id="intentInput" placeholder="Describe the task manually, or use the exact code extraction above..."></textarea>
            </div>

            <div>
                <span class="section-title">2. Execution</span>
                <button id="draftBtn" onclick="draftTicket()">Create Jira Ticket</button>
            </div>

            <div id="statusArea">
                <div id="statusText"></div>
                <button id="openJiraBtn" class="jira-btn">Open in Jira</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function aiAutoFill() {
                    vscode.postMessage({ type: 'aiAutoFill' });
                }

                function draftTicket() {
                    const intent = document.getElementById('intentInput').value;
                    if (!intent) return;
                    vscode.postMessage({ type: 'draftTicket', intent: intent });
                }

                // Handle responses from the extension backend
                window.addEventListener('message', event => {
                    const message = event.data;
                    const btn = document.getElementById('draftBtn');
                    const statusArea = document.getElementById('statusArea');
                    const statusText = document.getElementById('statusText');
                    const jiraBtn = document.getElementById('openJiraBtn');

                    if (message.type === 'fillInput') {
                        document.getElementById('intentInput').value = message.value;
                    }
                    else if (message.type === 'setLoading') {
                        btn.disabled = true; btn.innerText = "Drafting Ticket...";
                        statusArea.style.display = 'block'; jiraBtn.style.display = 'none';
                        statusText.innerHTML = '<span class="loader"></span> AI is analyzing code...';
                    } 
                    else if (message.type === 'setSuccess') {
                        btn.disabled = false; btn.innerText = "Create Another Ticket";
                        statusText.innerHTML = '✅ Draft Sent to Scrum Master!';
                        jiraBtn.style.display = 'block';
                        jiraBtn.onclick = () => window.open(message.url, '_blank');
                    }
                    else if (message.type === 'setError') {
                        btn.disabled = false; btn.innerText = "Create Jira Ticket";
                        statusText.innerHTML = '❌ Failed to connect to AWS backend.';
                    }
                });
            </script>
        </body>
        </html>`;
    }
}

function deactivate() {}
module.exports = { activate, deactivate }
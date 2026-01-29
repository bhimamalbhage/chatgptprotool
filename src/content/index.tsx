console.log("ChatGPT Pro Tool Content Script Loaded");
// @ts-ignore
import styles from '../index.css?inline';
console.log('Styles loaded length:', styles?.length);

import { createRoot } from 'react-dom/client';
import { ScrollControls } from '../features/scroll/ScrollControls';

// Mount Scroll Controls
const hostDiv = document.createElement('div');
hostDiv.id = 'chatgpt-pro-scroll-controls';
hostDiv.style.position = 'fixed'; // Ensure host doesn't affect layout
hostDiv.style.zIndex = '2147483647'; // Max z-index
document.body.appendChild(hostDiv);

const shadow = hostDiv.attachShadow({ mode: 'open' });

// Inject styles into the shadow root for our own UI
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
shadow.appendChild(styleSheet);

const rootDiv = document.createElement('div');
rootDiv.id = 'root'; // Optional, just for structure
shadow.appendChild(rootDiv);

// Keep our host root non-interactive and full-size
rootDiv.className = `w-full h-full pointer-events-none`;

createRoot(rootDiv).render(<ScrollControls />);


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === 'INSERT_PROMPT') {
        insertText(message.content);
        sendResponse({ success: true });
    }
});

function insertText(text: string) {
    // Strategy 1: Look for the specific ID used by ChatGPT (often a div with contenteditable or a textarea)
    const inputElement = document.querySelector('#prompt-textarea');

    // Strategy 2: Look for any contenteditable div in the main chat area
    const contentEditable = document.querySelector('div[contenteditable="true"]');

    const target = (inputElement || contentEditable) as HTMLElement;

    if (target) {
        target.focus();

        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
            const input = target as HTMLInputElement | HTMLTextAreaElement;
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const value = input.value;
            input.value = value.substring(0, start) + text + value.substring(end);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (target.isContentEditable) {
            // It's a div/span with contenteditable
            // The most robust way for modern React apps is often execCommand (deprecated but effective) 
            // or setting textContent and dispatching input.
            // Let's try execCommand first as it handles cursor position and undo history.
            const success = document.execCommand('insertText', false, text);

            if (!success) {
                // Fallback: Append text and trigger event
                target.textContent += text;
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    } else {
        console.warn("Could not find prompt input field");
        alert("Could not find the chat input field. Please click inside the input field first.");
    }
}

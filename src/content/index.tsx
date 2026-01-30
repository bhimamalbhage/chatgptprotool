console.log("ChatGPT Pro Tool Content Script Loaded");
// @ts-ignore
import styles from '../index.css?inline';
console.log('Styles loaded length:', styles?.length);

import { createRoot } from 'react-dom/client';
import { FloatingMenu } from '../features/menu/FloatingMenu';

// Mount Floating Menu
const hostDiv = document.createElement('div');
hostDiv.id = 'chatgpt-pro-tools';
hostDiv.style.position = 'fixed';
hostDiv.style.zIndex = '2147483647';
document.body.appendChild(hostDiv);

const shadow = hostDiv.attachShadow({ mode: 'open' });

// Inject styles into the shadow root
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
shadow.appendChild(styleSheet);

const rootDiv = document.createElement('div');
rootDiv.id = 'root';
shadow.appendChild(rootDiv);

rootDiv.className = `w-full h-full pointer-events-none`;

createRoot(rootDiv).render(<FloatingMenu shadowRoot={shadow} />);

// Listen for messages from the popup (for backward compatibility)
chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (message.type === 'INSERT_PROMPT') {
        insertText(message.content);
        sendResponse({ success: true });
    }
});

function insertText(text: string) {
    const inputElement = document.querySelector('#prompt-textarea');
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
            const success = document.execCommand('insertText', false, text);
            if (!success) {
                target.textContent += text;
                target.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    } else {
        console.warn("Could not find prompt input field");
        alert("Could not find the chat input field. Please click inside the input field first.");
    }
}

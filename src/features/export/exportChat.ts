import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { detectSite, getCurrentSiteName } from '../../shared/siteConfig';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * Extract chat messages from the page DOM (supports ChatGPT and Claude)
 */
export function extractMessages(): ChatMessage[] {
    const site = detectSite();

    if (site === 'claude') {
        return extractClaudeMessages();
    }
    return extractChatGPTMessages();
}

/**
 * Extract messages from Claude's DOM
 */
function extractClaudeMessages(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Claude's actual selectors (from inspect):
    // User messages: [data-testid="user-message"]
    // Assistant messages: .font-claude-response

    const userMessages = document.querySelectorAll('[data-testid="user-message"]');
    const assistantMessages = document.querySelectorAll('.font-claude-response');

    // Collect all messages with their positions
    const allMessages: { element: Element; role: 'user' | 'assistant' }[] = [];

    userMessages.forEach((el) => {
        allMessages.push({ element: el, role: 'user' });
    });

    assistantMessages.forEach((el) => {
        allMessages.push({ element: el, role: 'assistant' });
    });

    // Sort by document position to maintain conversation order
    allMessages.sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
        return 0;
    });

    // Extract content from each message
    allMessages.forEach(({ element, role }) => {
        const content = extractContentFromElement(element as HTMLElement);
        if (content.trim()) {
            messages.push({ role, content });
        }
    });

    return messages;
}

/**
 * Extract messages from ChatGPT's DOM
 */
function extractChatGPTMessages(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Strategy 1: Look for elements with data-message-author-role attribute
    const messageElements = document.querySelectorAll('[data-message-author-role]');

    if (messageElements.length > 0) {
        messageElements.forEach((el) => {
            const role = el.getAttribute('data-message-author-role') as 'user' | 'assistant';
            if (role === 'user' || role === 'assistant') {
                const content = extractContentFromElement(el as HTMLElement);
                if (content.trim()) {
                    messages.push({ role, content });
                }
            }
        });
    }

    // Strategy 2: Fallback - look for conversation article elements
    if (messages.length === 0) {
        const articles = document.querySelectorAll('article[data-testid]');
        articles.forEach((article) => {
            const testId = article.getAttribute('data-testid') || '';
            let role: 'user' | 'assistant' | null = null;

            if (testId.includes('user') || article.querySelector('[data-message-author-role="user"]')) {
                role = 'user';
            } else if (testId.includes('assistant') || article.querySelector('[data-message-author-role="assistant"]')) {
                role = 'assistant';
            }

            if (role) {
                const content = extractContentFromElement(article as HTMLElement);
                if (content.trim()) {
                    messages.push({ role, content });
                }
            }
        });
    }

    // Strategy 3: Look for the main conversation container and iterate
    if (messages.length === 0) {
        const conversationContainer = document.querySelector('main [class*="react-scroll-to-bottom"]') ||
            document.querySelector('main');

        if (conversationContainer) {
            const potentialMessages = conversationContainer.querySelectorAll('[class*="group"]');
            let lastRole: 'user' | 'assistant' = 'user';

            potentialMessages.forEach((el) => {
                const text = el.textContent?.trim() || '';
                if (text.length > 10) {
                    // Alternate roles as a simple heuristic
                    messages.push({ role: lastRole, content: text });
                    lastRole = lastRole === 'user' ? 'assistant' : 'user';
                }
            });
        }
    }

    return messages;
}

/**
 * Extract text content from a message element, preserving code blocks
 */
function extractContentFromElement(element: HTMLElement): string {
    const parts: string[] = [];

    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;

    // Process code blocks specially
    clone.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code');
        const codeContent = code?.textContent || pre.textContent || '';
        const lang = code?.className.match(/language-(\w+)/)?.[1] || '';
        pre.textContent = `\n\`\`\`${lang}\n${codeContent}\n\`\`\`\n`;
    });

    // Get text content
    const text = clone.textContent || '';

    // Clean up excessive whitespace while preserving paragraph breaks
    const cleaned = text
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (cleaned) {
        parts.push(cleaned);
    }

    return parts.join('\n');
}

/**
 * Generate a printable HTML document with the conversation
 */
export function generatePrintableHTML(messages: ChatMessage[]): string {
    const exportDate = new Date().toLocaleString();
    const siteName = getCurrentSiteName();

    const messageHTML = messages.map((msg) => {
        const roleLabel = msg.role === 'user' ? 'You' : siteName;
        const roleClass = msg.role;

        // Convert markdown-style code blocks to HTML
        const contentHTML = escapeHTML(msg.content)
            .replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
                return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
            })
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        return `
            <div class="message ${roleClass}">
                <div class="role">${roleLabel}</div>
                <div class="content">${contentHTML}</div>
            </div>
        `;
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${siteName} Export</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1a1a1a;
            background: #fff;
        }
        h1 {
            font-size: 24px;
            margin-bottom: 8px;
            color: #111;
        }
        .export-info {
            color: #666;
            font-size: 14px;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e5e5;
        }
        .message {
            margin: 20px 0;
            padding: 16px;
            border-radius: 12px;
        }
        .message.user {
            background: #f7f7f8;
        }
        .message.assistant {
            background: #fff;
            border: 1px solid #e5e5e5;
        }
        .role {
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 14px;
            color: #555;
        }
        .content {
            font-size: 15px;
        }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 13px;
        }
        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 12px 0;
        }
        pre code {
            background: transparent;
            padding: 0;
            color: inherit;
            font-size: 13px;
        }
        @media print {
            body {
                padding: 0;
                max-width: 100%;
            }
            .message {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            pre {
                white-space: pre-wrap;
                word-wrap: break-word;
            }
        }
    </style>
</head>
<body>
    <h1>${siteName} Conversation</h1>
    <p class="export-info">Exported on ${exportDate}</p>
    ${messageHTML}
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export the current conversation as a PDF using the browser's print dialog
 */
export function exportAsPDF(): void {
    const messages = extractMessages();
    const siteName = getCurrentSiteName();

    if (messages.length === 0) {
        alert(`No conversation found to export. Make sure you have an active ${siteName} conversation on the page.`);
        return;
    }

    const html = generatePrintableHTML(messages);

    // Open a new window with the printable content
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        alert('Unable to open print window. Please check your popup blocker settings.');
        return;
    }

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}

/**
 * Export the current conversation as a Word document (.docx)
 */
export async function exportAsDocx(): Promise<void> {
    const messages = extractMessages();
    const siteName = getCurrentSiteName();

    if (messages.length === 0) {
        alert(`No conversation found to export. Make sure you have an active ${siteName} conversation on the page.`);
        return;
    }

    const exportDate = new Date().toLocaleString();

    // Build document content
    const children: Paragraph[] = [
        new Paragraph({
            text: `${siteName} Conversation`,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `Exported on ${exportDate}`,
                    color: '666666',
                    size: 22,
                }),
            ],
            spacing: { after: 400 },
            border: {
                bottom: {
                    color: 'CCCCCC',
                    space: 10,
                    size: 6,
                    style: BorderStyle.SINGLE,
                },
            },
        }),
    ];

    // Add each message
    for (const msg of messages) {
        const roleLabel = msg.role === 'user' ? 'You' : siteName;
        const isUser = msg.role === 'user';

        // Role label paragraph
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: roleLabel,
                        bold: true,
                        size: 24,
                        color: isUser ? '1a73e8' : '0d9488',
                    }),
                ],
                spacing: { before: 300, after: 100 },
            })
        );

        // Message content - split by lines and handle code blocks
        const contentLines = msg.content.split('\n');
        let inCodeBlock = false;
        let codeBlockContent: string[] = [];

        for (const line of contentLines) {
            if (line.startsWith('```')) {
                if (inCodeBlock) {
                    // End of code block - add accumulated code
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: codeBlockContent.join('\n'),
                                    font: 'Courier New',
                                    size: 20,
                                }),
                            ],
                            shading: {
                                fill: 'F3F4F6',
                            },
                            spacing: { before: 100, after: 100 },
                        })
                    );
                    codeBlockContent = [];
                    inCodeBlock = false;
                } else {
                    // Start of code block
                    inCodeBlock = true;
                }
            } else if (inCodeBlock) {
                codeBlockContent.push(line);
            } else if (line.trim()) {
                // Regular text line
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: 24,
                            }),
                        ],
                        spacing: { after: 100 },
                    })
                );
            }
        }

        // Handle unclosed code block
        if (inCodeBlock && codeBlockContent.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: codeBlockContent.join('\n'),
                            font: 'Courier New',
                            size: 20,
                        }),
                    ],
                    shading: {
                        fill: 'F3F4F6',
                    },
                    spacing: { before: 100, after: 100 },
                })
            );
        }
    }

    // Create the document
    const doc = new Document({
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });

    // Generate and save the file
    const blob = await Packer.toBlob(doc);
    const filename = `${siteName}_Export_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, filename);
}

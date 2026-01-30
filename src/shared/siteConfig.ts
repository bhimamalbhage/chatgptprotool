// Site detection and configuration for multi-platform support

export type SiteType = 'chatgpt' | 'claude' | 'unknown';

export interface SiteConfig {
    name: string;
    inputSelector: string;
    inputFallbackSelector: string;
    messageContainerSelector: string;
    userMessageSelector: string;
    assistantMessageSelector: string;
    scrollContainerSelector: string;
}

const siteConfigs: Record<SiteType, SiteConfig> = {
    chatgpt: {
        name: 'ChatGPT',
        inputSelector: '#prompt-textarea',
        inputFallbackSelector: 'div[contenteditable="true"]',
        messageContainerSelector: '[class*="conversation"], main',
        userMessageSelector: '[data-message-author-role="user"]',
        assistantMessageSelector: '[data-message-author-role="assistant"]',
        scrollContainerSelector: 'main',
    },
    claude: {
        name: 'Claude',
        inputSelector: '[contenteditable="true"].ProseMirror',
        inputFallbackSelector: 'div[contenteditable="true"]',
        messageContainerSelector: '[class*="conversation"], main',
        userMessageSelector: '[data-testid="user-message"], .font-user-message',
        assistantMessageSelector: '[data-testid="assistant-message"], .font-claude-message',
        scrollContainerSelector: '[class*="overflow-y-auto"]',
    },
    unknown: {
        name: 'Unknown',
        inputSelector: 'textarea',
        inputFallbackSelector: 'div[contenteditable="true"]',
        messageContainerSelector: 'main',
        userMessageSelector: '',
        assistantMessageSelector: '',
        scrollContainerSelector: 'main',
    },
};

export const detectSite = (): SiteType => {
    const hostname = window.location.hostname;

    if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
        return 'chatgpt';
    }
    if (hostname.includes('claude.ai')) {
        return 'claude';
    }
    return 'unknown';
};

export const getSiteConfig = (): SiteConfig => {
    const site = detectSite();
    return siteConfigs[site];
};

export const getCurrentSiteName = (): string => {
    return getSiteConfig().name;
};

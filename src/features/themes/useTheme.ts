import { useState, useEffect, useCallback, useRef } from 'react';
import { themes, getThemeById, DEFAULT_THEME_ID, DEFAULT_CHATGPT_THEME_ID } from './themes';
import { getStoredTheme, setStoredTheme } from './storage';
import type { Theme, ThemeColors } from './types';

interface UseThemeOptions {
    shadowRoot?: ShadowRoot | null;
}

interface UseThemeReturn {
    themeId: string;
    theme: Theme;
    themeList: Theme[];
    changeTheme: (id: string) => void;
}

const STYLE_ID = 'chatgpt-pro-theme-overrides';
const CHATGPT_STYLE_ID = 'chatgpt-pro-page-theme';

const generateCSSVariables = (colors: ThemeColors): string => {
    return `
:host, :root {
    --color-theme-bg: ${colors.bg};
    --color-theme-bg-secondary: ${colors.bgSecondary};
    --color-theme-text: ${colors.text};
    --color-theme-text-secondary: ${colors.textSecondary};
    --color-theme-accent: ${colors.accent};
    --color-theme-accent-text: ${colors.accentText};
    --color-theme-border: ${colors.border};
    --color-theme-hover: ${colors.hover};
}
`.trim();
};

// Generate CSS overrides for ChatGPT's UI
const generateChatGPTOverrides = (colors: ThemeColors): string => {
    return `
/* ChatGPT Pro Tool - Theme Overrides */
:root {
    /* Override ChatGPT's CSS variables */
    --main-surface-primary: ${colors.bg} !important;
    --main-surface-secondary: ${colors.bgSecondary} !important;
    --main-surface-tertiary: ${colors.hover} !important;
    --sidebar-surface-primary: ${colors.bg} !important;
    --sidebar-surface-secondary: ${colors.bgSecondary} !important;
    --sidebar-surface-tertiary: ${colors.hover} !important;
    --text-primary: ${colors.text} !important;
    --text-secondary: ${colors.textSecondary} !important;
    --text-tertiary: ${colors.textSecondary} !important;
    --border-light: ${colors.border} !important;
    --border-medium: ${colors.border} !important;
    --border-heavy: ${colors.border} !important;
    --link: ${colors.accent} !important;
    --link-hover: ${colors.accent} !important;
}

/* Main background */
html, body {
    background-color: ${colors.bg} !important;
}

/* Main chat area */
main, [role="main"] {
    background-color: ${colors.bg} !important;
}

/* Sidebar */
nav, [class*="sidebar"], [data-testid*="sidebar"] {
    background-color: ${colors.bg} !important;
}

/* Chat messages container */
[class*="conversation"], [class*="chat-pg"] {
    background-color: ${colors.bg} !important;
}

/* Text colors */
[class*="prose"], [class*="markdown"], p, span, div, h1, h2, h3, h4, h5, h6 {
    color: ${colors.text} !important;
}

/* Secondary text */
[class*="text-token-text-secondary"], [class*="text-gray"], .text-muted {
    color: ${colors.textSecondary} !important;
}

/* Buttons and interactive elements */
button:not([class*="chatgpt-pro"]) {
    color: ${colors.text} !important;
}

button:hover:not([class*="chatgpt-pro"]) {
    background-color: ${colors.hover} !important;
}

/* Input area */
textarea, input[type="text"], [contenteditable="true"] {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
    border-color: ${colors.border} !important;
}

/* Chat input container - bottom composer area */
form, [class*="composer"], [class*="input-area"] {
    background-color: ${colors.bg} !important;
}

/* Sticky bottom input area */
[class*="sticky"], [class*="bottom-0"], [class*="composer-parent"] {
    background-color: ${colors.bg} !important;
}

/* ChatGPT specific input container */
#prompt-textarea {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
}

/* The wrapper around the input */
[id*="prompt"], [class*="prompt-textarea"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Bottom bar / footer area */
[class*="xl:max-w-"], [class*="max-w-3xl"], [class*="max-w-4xl"] {
    background-color: transparent !important;
}

/* Input container with rounded corners */
[class*="rounded-"][class*="border"][class*="flex"][class*="items-end"],
[class*="rounded-3xl"][class*="border"],
[class*="rounded-2xl"][class*="border"] {
    background-color: ${colors.bgSecondary} !important;
    border-color: ${colors.border} !important;
}

/* ChatGPT's dark input background override */
[class*="bg-token-main-surface"],
[class*="bg-gray-"],
[class*="dark:bg-"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Main container backgrounds */
.dark, [class*="dark:"] {
    --tw-bg-opacity: 1 !important;
}

/* The actual input field parent div */
[class*="flex"][class*="w-full"][class*="flex-col"] > [class*="relative"] {
    background-color: ${colors.bg} !important;
}

/* ProseMirror editor (if used) */
.ProseMirror, [class*="ProseMirror"], #prompt-textarea {
    background-color: transparent !important;
    color: ${colors.text} !important;
}

/* The composer surface - the rounded input container */
[data-composer-surface="true"],
.dark\\:bg-\\[\\#303030\\],
[class*="dark:bg-[#303030]"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Direct parent of ProseMirror */
.ProseMirror-parent, [class*="prosemirror-parent"] {
    background-color: transparent !important;
}

/* Placeholder text */
[class*="placeholder"], ::placeholder {
    color: ${colors.textSecondary} !important;
}

/* === ChatGPT Bottom Input Area === */

/* Main thread bottom container */
#thread-bottom {
    background-color: ${colors.bg} !important;
}

/* All divs inside thread-bottom */
#thread-bottom > div,
#thread-bottom > div > div,
#thread-bottom > div > div > div {
    background-color: ${colors.bg} !important;
}

/* The composer container with the input */
[data-composer-surface="true"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Override ChatGPT's token background classes */
.bg-token-bg-primary {
    background-color: ${colors.bg} !important;
}

.bg-token-bg-secondary {
    background-color: ${colors.bgSecondary} !important;
}

.bg-token-bg-tertiary {
    background-color: ${colors.hover} !important;
}

/* Override dark mode inline Tailwind classes */
[class*="dark:bg-[#"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Composer surface override */
[data-composer-surface] {
    background-color: ${colors.bgSecondary} !important;
}

/* The form wrapper */
form[class*="composer"] {
    background-color: transparent !important;
}

/* Pointer events container */
.pointer-events-auto {
    background-color: transparent !important;
}

/* Text token colors */
.text-token-text-primary {
    color: ${colors.text} !important;
}

.text-token-text-secondary {
    color: ${colors.textSecondary} !important;
}

.text-token-text-tertiary {
    color: ${colors.textSecondary} !important;
}

/* Composer buttons */
.composer-btn {
    color: ${colors.textSecondary} !important;
}

.composer-btn:hover {
    color: ${colors.text} !important;
    background-color: ${colors.hover} !important;
}

/* Submit button - keep accent color */
.composer-submit-button-color {
    background-color: ${colors.accent} !important;
    color: ${colors.accentText} !important;
}

/* User messages */
[data-message-author-role="user"], [class*="user-message"] {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
}

/* Assistant messages */
[data-message-author-role="assistant"], [class*="assistant-message"] {
    background-color: ${colors.bg} !important;
    color: ${colors.text} !important;
}

/* Code blocks */
pre, code, [class*="code-block"] {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
    border-color: ${colors.border} !important;
}

/* Scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: ${colors.bg};
}

::-webkit-scrollbar-thumb {
    background: ${colors.border};
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: ${colors.textSecondary};
}

/* Links */
a:not([class*="chatgpt-pro"]) {
    color: ${colors.accent} !important;
}

/* Selection */
::selection {
    background-color: ${colors.accent}40 !important;
    color: ${colors.text} !important;
}

/* Borders */
[class*="border"], hr {
    border-color: ${colors.border} !important;
}

/* Dropdowns and menus */
[role="menu"], [role="listbox"], [class*="dropdown"], [class*="popover"] {
    background-color: ${colors.bgSecondary} !important;
    border-color: ${colors.border} !important;
}

[role="menuitem"], [role="option"] {
    color: ${colors.text} !important;
}

[role="menuitem"]:hover, [role="option"]:hover {
    background-color: ${colors.hover} !important;
}

/* Header */
header, [class*="header"] {
    background-color: ${colors.bg} !important;
    border-color: ${colors.border} !important;
}

/* Accent color for special elements */
[class*="primary"], [class*="accent"] {
    color: ${colors.accent} !important;
}

/* Icons */
svg:not([class*="chatgpt-pro"]) {
    color: inherit !important;
}
`.trim();
};

const injectThemeStyles = (shadowRoot: ShadowRoot | null, colors: ThemeColors): void => {
    if (!shadowRoot) return;

    let styleEl = shadowRoot.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        shadowRoot.appendChild(styleEl);
    }

    styleEl.textContent = generateCSSVariables(colors);
};

// Inject theme overrides into the main ChatGPT page
const injectChatGPTTheme = (colors: ThemeColors): void => {
    let styleEl = document.getElementById(CHATGPT_STYLE_ID) as HTMLStyleElement | null;

    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = CHATGPT_STYLE_ID;
        document.head.appendChild(styleEl);
    }

    styleEl.textContent = generateChatGPTOverrides(colors);
};

// Remove ChatGPT theme overrides (for reset/default) - exported for future use
export const removeChatGPTTheme = (): void => {
    const styleEl = document.getElementById(CHATGPT_STYLE_ID);
    if (styleEl) {
        styleEl.remove();
    }
};

export const useTheme = ({ shadowRoot }: UseThemeOptions = {}): UseThemeReturn => {
    const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
    const shadowRootRef = useRef<ShadowRoot | null>(null);

    // Store shadow root ref for use in callbacks
    useEffect(() => {
        shadowRootRef.current = shadowRoot || null;
    }, [shadowRoot]);

    // Apply theme to both extension UI and ChatGPT page
    const applyTheme = useCallback((theme: Theme) => {
        // Always apply to extension UI (shadow root)
        injectThemeStyles(shadowRootRef.current, theme.colors);

        // For "default" theme, remove ChatGPT overrides to restore original look
        if (theme.id === DEFAULT_CHATGPT_THEME_ID) {
            removeChatGPTTheme();
        } else {
            injectChatGPTTheme(theme.colors);
        }
    }, []);

    // Load theme from storage on mount
    useEffect(() => {
        const loadTheme = async () => {
            const storedThemeId = await getStoredTheme();
            setThemeId(storedThemeId);

            const theme = getThemeById(storedThemeId);
            applyTheme(theme);
        };

        loadTheme();
    }, [applyTheme]);

    // Inject theme when shadowRoot becomes available
    useEffect(() => {
        if (shadowRoot) {
            const theme = getThemeById(themeId);
            applyTheme(theme);
        }
    }, [shadowRoot, themeId, applyTheme]);

    // Listen for storage changes (cross-tab sync)
    useEffect(() => {
        if (typeof chrome === 'undefined' || !chrome.storage) return;

        const handleStorageChange = (
            changes: { [key: string]: chrome.storage.StorageChange },
            areaName: string
        ) => {
            if (areaName === 'local' && changes.chatgpt_pro_theme) {
                const newThemeId = (changes.chatgpt_pro_theme.newValue as string) || DEFAULT_THEME_ID;
                setThemeId(newThemeId);

                const theme = getThemeById(newThemeId);
                applyTheme(theme);
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [applyTheme]);

    const changeTheme = useCallback(async (id: string) => {
        setThemeId(id);
        await setStoredTheme(id);

        const theme = getThemeById(id);
        applyTheme(theme);
    }, [applyTheme]);

    const theme = getThemeById(themeId);

    return {
        themeId,
        theme,
        themeList: themes,
        changeTheme,
    };
};

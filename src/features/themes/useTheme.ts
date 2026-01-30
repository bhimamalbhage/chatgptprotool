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

/* === LOGOS AND AVATARS === */

/* ChatGPT logo in header/sidebar */
[class*="logo"], [class*="brand"], [aria-label*="ChatGPT"] {
    color: ${colors.text} !important;
}

/* OpenAI logo SVG */
svg[class*="openai"], svg[aria-label*="OpenAI"], svg[aria-label*="ChatGPT"] {
    fill: ${colors.text} !important;
    color: ${colors.text} !important;
}

/* User avatar container */
[class*="avatar"], [class*="user-avatar"], [class*="profile"] {
    border-color: ${colors.border} !important;
}

/* User initials avatar (like "BM") */
[class*="avatar"] span, [class*="avatar"] div {
    color: ${colors.text} !important;
}

/* Sidebar user info section */
[class*="account"], [class*="user-menu"], [data-testid*="profile"] {
    background-color: ${colors.bg} !important;
    color: ${colors.text} !important;
}

/* Navigation icons in sidebar */
nav svg, [class*="sidebar"] svg {
    color: ${colors.textSecondary} !important;
}

nav button:hover svg, [class*="sidebar"] button:hover svg {
    color: ${colors.text} !important;
}

/* GPTs icons/avatars */
[class*="gizmo"], [class*="gpt-icon"] {
    border-color: ${colors.border} !important;
}

/* Badge/pill elements */
[class*="badge"], [class*="pill"], [class*="tag"] {
    background-color: ${colors.hover} !important;
    color: ${colors.text} !important;
    border-color: ${colors.border} !important;
}

/* Free offer banner */
[class*="banner"], [class*="offer"], [class*="promo"] {
    background-color: ${colors.bgSecondary} !important;
    border-color: ${colors.border} !important;
}

/* Model selector dropdown */
[class*="model-selector"], [class*="model-switcher"], [data-testid*="model"] {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
}

/* Share button and other header buttons */
header button, [class*="header"] button {
    color: ${colors.textSecondary} !important;
}

header button:hover, [class*="header"] button:hover {
    color: ${colors.text} !important;
    background-color: ${colors.hover} !important;
}

/* "New chat" button styling */
[class*="new-chat"], [data-testid*="new-chat"] {
    color: ${colors.text} !important;
}

/* Chat list items */
[class*="conversation-list"] a, [class*="chat-list"] a, nav a {
    color: ${colors.text} !important;
}

[class*="conversation-list"] a:hover, [class*="chat-list"] a:hover, nav a:hover {
    background-color: ${colors.hover} !important;
}

/* Active/selected chat */
[class*="conversation-list"] [class*="active"],
[class*="conversation-list"] [class*="selected"],
nav [class*="bg-token-sidebar-surface-secondary"] {
    background-color: ${colors.hover} !important;
}

/* Sidebar section headers (GPTs, Your chats, etc.) */
[class*="sidebar"] h3, [class*="sidebar"] h4, nav h3, nav h4 {
    color: ${colors.textSecondary} !important;
}

/* Tooltip styling */
[role="tooltip"], [class*="tooltip"] {
    background-color: ${colors.bgSecondary} !important;
    color: ${colors.text} !important;
    border-color: ${colors.border} !important;
}

/* Modal/Dialog backgrounds */
[role="dialog"], [class*="modal"] {
    background-color: ${colors.bgSecondary} !important;
    border-color: ${colors.border} !important;
}

/* Token-based surface colors (ChatGPT specific) */
[class*="bg-token-sidebar"] {
    background-color: ${colors.bg} !important;
}

[class*="bg-token-main"] {
    background-color: ${colors.bg} !important;
}

/* Ensure all text inherits properly */
[class*="text-token"] {
    color: ${colors.text} !important;
}

/* === PROMOTIONAL BANNERS === */

/* "Try Plus free" banner - ultra specific selectors */
aside.flex.w-full,
aside[class*="rounded-3xl"],
aside[class*="rounded-t-"],
aside[class*="bg-token"] {
    background-color: ${colors.bgSecondary} !important;
    border-color: ${colors.border} !important;
}

/* Target by attribute contains for Tailwind ! modifier classes */
[class*="bg-token-bg-tertiary"] {
    background-color: ${colors.bgSecondary} !important;
}

/* Force all aside backgrounds */
aside, aside > div, aside div {
    background-color: ${colors.bgSecondary} !important;
}

aside, aside * {
    border-color: ${colors.border} !important;
}

/* Banner text */
aside span, aside div, aside p {
    color: ${colors.text} !important;
}

aside .text-token-text-secondary,
aside [class*="text-sm"] {
    color: ${colors.textSecondary} !important;
}

/* The specific promo banner structure */
[class*="bottom-full"] > div,
[class*="bottom-full"] > div > div,
[class*="bottom-full"] aside {
    background-color: ${colors.bgSecondary} !important;
}

/* "Try Plus free" / upgrade buttons in banner */
aside button,
aside .btn,
aside [class*="btn-"] {
    background-color: ${colors.hover} !important;
    border-color: ${colors.border} !important;
    color: ${colors.accent} !important;
}

aside button:hover {
    background-color: ${colors.border} !important;
}

/* Close button */
aside [data-testid="close-button"],
aside button[aria-label="Close"] {
    background-color: transparent !important;
    color: ${colors.textSecondary} !important;
}

aside [data-testid="close-button"]:hover,
aside button[aria-label="Close"]:hover {
    background-color: ${colors.hover} !important;
    color: ${colors.text} !important;
}

/* Token surface classes */
[class*="bg-token-surface"],
[class*="hover:bg-token-surface"]:hover {
    background-color: ${colors.hover} !important;
}

/* All token border colors */
[class*="border-token-border"] {
    border-color: ${colors.border} !important;
}

/* Force override any inline dark: classes */
.dark [class*="dark\\:bg-"],
[class*="dark:bg-token"],
[class*="dark:bg-\\["] {
    background-color: ${colors.bgSecondary} !important;
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

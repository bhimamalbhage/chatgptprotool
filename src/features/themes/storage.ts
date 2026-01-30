import { DEFAULT_THEME_ID } from './themes';

const STORAGE_KEY = 'chatgpt_pro_theme';

export const getStoredTheme = async (): Promise<string> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        return DEFAULT_THEME_ID;
    }

    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as string) || DEFAULT_THEME_ID;
};

export const setStoredTheme = async (themeId: string): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: themeId });
    }
};

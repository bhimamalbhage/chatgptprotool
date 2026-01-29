import type { Prompt } from './types';

export const STORAGE_KEY = 'chatgpt_pro_prompts';

export const getPrompts = async (): Promise<Prompt[]> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome storage API not available, returning empty list');
        return [];
    }

    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as Prompt[]) || [];
};

export const savePrompt = async (prompt: Prompt): Promise<void> => {
    const prompts = await getPrompts();
    const index = prompts.findIndex((p) => p.id === prompt.id);

    if (index >= 0) {
        prompts[index] = prompt;
    } else {
        prompts.push(prompt);
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: prompts });
    }
};

export const deletePrompt = async (promptId: string): Promise<void> => {
    const prompts = await getPrompts();
    const updatedPrompts = prompts.filter((p) => p.id !== promptId);

    if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [STORAGE_KEY]: updatedPrompts });
    }
};

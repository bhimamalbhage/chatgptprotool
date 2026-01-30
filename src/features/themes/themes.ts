import type { Theme } from './types';

// Special ID for default/no-override theme
export const DEFAULT_CHATGPT_THEME_ID = 'default';

export const themes: Theme[] = [
    {
        id: 'default',
        name: 'Default',
        colors: {
            // These won't be applied - this theme removes overrides
            bg: '#212121',
            bgSecondary: '#2f2f2f',
            text: '#ececec',
            textSecondary: '#b4b4b4',
            accent: '#10a37f',
            accentText: '#ffffff',
            border: '#444444',
            hover: '#3a3a3a',
        },
    },
    {
        id: 'midnight',
        name: 'Midnight',
        colors: {
            bg: '#050816',
            bgSecondary: '#0b1020',
            text: '#e5e7eb',
            textSecondary: '#9ca3af',
            accent: '#10a37f',
            accentText: '#ffffff',
            border: '#1f2933',
            hover: '#111827',
        },
    },
    {
        id: 'ocean-depths',
        name: 'Ocean Depths',
        colors: {
            bg: '#0a192f',
            bgSecondary: '#112240',
            text: '#ccd6f6',
            textSecondary: '#8892b0',
            accent: '#64ffda',
            accentText: '#0a192f',
            border: '#233554',
            hover: '#172a45',
        },
    },
    {
        id: 'rose-gold',
        name: 'Rose Gold',
        colors: {
            bg: '#1a1418',
            bgSecondary: '#231d21',
            text: '#f5e6e8',
            textSecondary: '#c9b8bb',
            accent: '#e8b4b8',
            accentText: '#1a1418',
            border: '#3d3336',
            hover: '#2d2528',
        },
    },
    {
        id: 'forest',
        name: 'Forest',
        colors: {
            bg: '#0d1117',
            bgSecondary: '#161b22',
            text: '#c9d1d9',
            textSecondary: '#8b949e',
            accent: '#56d364',
            accentText: '#0d1117',
            border: '#30363d',
            hover: '#21262d',
        },
    },
    {
        id: 'lavender-dreams',
        name: 'Lavender Dreams',
        colors: {
            bg: '#13111c',
            bgSecondary: '#1a1725',
            text: '#e2dff3',
            textSecondary: '#a9a5c0',
            accent: '#9d8cff',
            accentText: '#13111c',
            border: '#2d2a3d',
            hover: '#231f30',
        },
    },
];

export const DEFAULT_THEME_ID = 'default';

export const getThemeById = (id: string): Theme => {
    return themes.find((t) => t.id === id) || themes[0];
};

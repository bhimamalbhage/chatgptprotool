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
    // === DARK / NIGHT MODE THEMES ===
    {
        id: 'oled-black',
        name: 'OLED Black',
        colors: {
            // True black for OLED screens - maximum battery saving
            bg: '#000000',
            bgSecondary: '#0a0a0a',
            text: '#e4e4e7',
            textSecondary: '#a1a1aa',
            accent: '#10a37f',
            accentText: '#ffffff',
            border: '#1a1a1a',
            hover: '#141414',
        },
    },
    {
        id: 'night-mode',
        name: 'Night Mode',
        colors: {
            // Warm tones, reduced blue light for nighttime use
            bg: '#1a1512',
            bgSecondary: '#241f1a',
            text: '#e8e0d5',
            textSecondary: '#b8a99a',
            accent: '#d4a574',
            accentText: '#1a1512',
            border: '#3d352c',
            hover: '#2d2620',
        },
    },
    {
        id: 'soft-dark',
        name: 'Soft Dark',
        colors: {
            // Softer dark theme, easier on eyes than pure black
            bg: '#1e1e1e',
            bgSecondary: '#282828',
            text: '#d4d4d4',
            textSecondary: '#9d9d9d',
            accent: '#4fc3f7',
            accentText: '#1e1e1e',
            border: '#3c3c3c',
            hover: '#333333',
        },
    },
    {
        id: 'dim',
        name: 'Dim',
        colors: {
            // Lightweight dim theme - not too dark, reduces eye strain
            bg: '#15202b',
            bgSecondary: '#192734',
            text: '#d9d9d9',
            textSecondary: '#8899a6',
            accent: '#1d9bf0',
            accentText: '#ffffff',
            border: '#38444d',
            hover: '#22303c',
        },
    },
    // === AESTHETIC THEMES ===
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

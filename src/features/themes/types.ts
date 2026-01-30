export interface ThemeColors {
    bg: string;
    bgSecondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentText: string;
    border: string;
    hover: string;
}

export interface Theme {
    id: string;
    name: string;
    colors: ThemeColors;
}

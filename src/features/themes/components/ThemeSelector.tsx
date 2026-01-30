import React from 'react';
import type { Theme } from '../types';

interface ThemeSelectorProps {
    themes: Theme[];
    currentThemeId: string;
    onSelectTheme: (themeId: string) => void;
    onBack: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    themes,
    currentThemeId,
    onSelectTheme,
    onBack,
}) => {
    return (
        <div className="bg-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border shadow-2xl rounded-2xl overflow-hidden w-[280px]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-theme-border/50 flex items-center gap-3 bg-theme-bg-secondary">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onBack();
                    }}
                    className="text-theme-text-secondary hover:text-theme-text-primary p-1 -ml-1 rounded-lg hover:bg-theme-hover transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm font-semibold text-theme-text-primary">Themes</span>
            </div>

            {/* Theme Grid */}
            <div className="p-3 grid grid-cols-2 gap-2">
                {themes.map((theme) => {
                    const isSelected = theme.id === currentThemeId;
                    return (
                        <button
                            key={theme.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectTheme(theme.id);
                            }}
                            className={`relative p-3 rounded-xl transition-all text-left ${
                                isSelected
                                    ? 'ring-2 ring-theme-accent bg-theme-hover'
                                    : 'hover:bg-theme-hover'
                            }`}
                        >
                            {/* Color Swatches */}
                            <div className="flex gap-1 mb-2">
                                <div
                                    className="w-4 h-4 rounded-full border border-white/10"
                                    style={{ backgroundColor: theme.colors.bg }}
                                    title="Background"
                                />
                                <div
                                    className="w-4 h-4 rounded-full border border-white/10"
                                    style={{ backgroundColor: theme.colors.bgSecondary }}
                                    title="Secondary"
                                />
                                <div
                                    className="w-4 h-4 rounded-full border border-white/10"
                                    style={{ backgroundColor: theme.colors.accent }}
                                    title="Accent"
                                />
                            </div>

                            {/* Theme Name */}
                            <span className="text-xs font-medium text-theme-text-primary block truncate">
                                {theme.name}
                            </span>

                            {/* Selection Indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2">
                                    <svg
                                        className="w-4 h-4 text-theme-accent"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

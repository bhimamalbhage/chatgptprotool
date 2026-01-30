import React, { useState, useEffect } from 'react';
import { exportAsPDF, exportAsDocx } from '../export/exportChat';
import { getPrompts, savePrompt, deletePrompt } from '../prompts/storage';
import type { Prompt } from '../prompts/types';
import { getSiteConfig } from '../../shared/siteConfig';
// TODO: Themes feature - uncomment when ready
// import { useTheme } from '../themes/useTheme';
// import { ThemeSelector } from '../themes/components/ThemeSelector';

type View = 'menu' | 'prompts' | 'newPrompt'; // | 'themes' - TODO: uncomment when ready

interface FloatingMenuProps {
    shadowRoot?: ShadowRoot;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ shadowRoot: _shadowRoot }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<View>('menu');
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [newPromptTitle, setNewPromptTitle] = useState('');
    const [newPromptContent, setNewPromptContent] = useState('');

    // TODO: Themes feature - uncomment when ready
    // const { themeId, themeList, changeTheme } = useTheme({ shadowRoot });

    // Load prompts
    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        const loaded = await getPrompts();
        setPrompts(loaded);
    };

    const handleClose = () => {
        setIsOpen(false);
        setView('menu');
        setNewPromptTitle('');
        setNewPromptContent('');
    };

    const handleToggle = () => {
        if (isOpen) {
            handleClose();
        } else {
            setIsOpen(true);
            loadPrompts();
        }
    };

    // Scroll functions
    const getBestScrollContainer = (): HTMLElement => {
        const allElements = document.querySelectorAll('*');
        let bestCandidate: HTMLElement | null = null;
        let maxArea = 0;

        for (const el of Array.from(allElements)) {
            const style = window.getComputedStyle(el);
            if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
                const rect = el.getBoundingClientRect();
                if (rect.height > window.innerHeight * 0.3 && rect.width > 300) {
                    const area = rect.height * rect.width;
                    if (area > maxArea) {
                        maxArea = area;
                        bestCandidate = el as HTMLElement;
                    }
                }
            }
        }
        return bestCandidate || document.documentElement;
    };

    const scrollToTop = () => {
        console.log('Scroll to top clicked');
        const container = getBestScrollContainer();
        console.log('Scroll container:', container);
        container.scrollTo({ top: 0, behavior: 'smooth' });
        handleClose();
    };

    const scrollToBottom = () => {
        console.log('Scroll to bottom clicked');
        const container = getBestScrollContainer();
        console.log('Scroll container:', container, 'scrollHeight:', container.scrollHeight);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        handleClose();
    };

    // Export functions
    const handleExportPDF = () => {
        console.log('Export PDF clicked');
        handleClose();
        // Delay to let menu close first
        setTimeout(() => {
            exportAsPDF();
        }, 100);
    };

    const handleExportDocx = async () => {
        console.log('Export Docx clicked');
        handleClose();
        // Delay to let menu close first
        setTimeout(async () => {
            await exportAsDocx();
        }, 100);
    };

    // Prompt functions
    const insertText = (text: string) => {
        console.log('Insert text:', text);
        const siteConfig = getSiteConfig();
        const inputElement = document.querySelector(siteConfig.inputSelector);
        const contentEditable = document.querySelector(siteConfig.inputFallbackSelector);
        const target = (inputElement || contentEditable) as HTMLElement;

        if (target) {
            target.focus();

            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                const input = target as HTMLInputElement | HTMLTextAreaElement;
                // Get existing text and append new text at the end
                const existingText = input.value;
                const separator = existingText && !existingText.endsWith(' ') && !existingText.endsWith('\n') ? ' ' : '';
                input.value = existingText + separator + text;
                // Move cursor to end
                input.selectionStart = input.selectionEnd = input.value.length;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            } else if (target.isContentEditable) {
                // For contentEditable, move cursor to end first
                const selection = window.getSelection();
                const range = document.createRange();

                // Move cursor to end of content
                range.selectNodeContents(target);
                range.collapse(false); // false = collapse to end
                selection?.removeAllRanges();
                selection?.addRange(range);

                // Get existing text and add separator if needed
                const existingText = target.textContent || '';
                const separator = existingText && !existingText.endsWith(' ') && !existingText.endsWith('\n') ? ' ' : '';

                // Insert the text at the end
                document.execCommand('insertText', false, separator + text);
            }
        } else {
            console.warn('No input element found');
        }
        handleClose();
    };

    const handleSavePrompt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPromptTitle.trim() || !newPromptContent.trim()) return;

        const newPrompt: Prompt = {
            id: crypto.randomUUID(),
            title: newPromptTitle,
            content: newPromptContent,
            createdAt: Date.now(),
        };

        await savePrompt(newPrompt);
        await loadPrompts();
        setNewPromptTitle('');
        setNewPromptContent('');
        setView('prompts');
    };

    const handleDeletePrompt = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deletePrompt(id);
        await loadPrompts();
    };

    const handlePromptClick = (content: string) => {
        insertText(content);
    };

    // Menu items with direct handlers
    const menuItems = [
        { icon: 'scroll-up', label: 'Scroll to Top', action: scrollToTop },
        { icon: 'scroll-down', label: 'Scroll to Bottom', action: scrollToBottom },
        { icon: 'pdf', label: 'Export as PDF', action: handleExportPDF },
        { icon: 'doc', label: 'Export as Word', action: handleExportDocx },
        { icon: 'prompts', label: 'Saved Prompts', action: () => setView('prompts') },
        // TODO: Themes feature - uncomment when ready
        // { icon: 'themes', label: 'Themes', action: () => setView('themes') },
    ];

    const getIcon = (name: string) => {
        switch (name) {
            case 'scroll-up':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />;
            case 'scroll-down':
                return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />;
            case 'pdf':
                return <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h4" /></>;
            case 'doc':
                return <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></>;
            case 'prompts':
                return <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></>;
            // TODO: Themes feature - uncomment when ready
            // case 'themes':
            //     return <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></>;
            default:
                return null;
        }
    };

    return (
        <div className="fixed bottom-12 right-6 z-[999999] pointer-events-auto">
            {/* Backdrop to close menu */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={handleClose}
                />
            )}

            {/* Expanded Menu */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {view === 'menu' && (
                        <div className="bg-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border shadow-2xl rounded-2xl overflow-hidden min-w-[200px]">
                            {menuItems.map((item, index) => (
                                <button
                                    key={item.label}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Menu item clicked:', item.label);
                                        item.action();
                                    }}
                                    className={`w-full px-4 py-3 flex items-center gap-3 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover transition-all duration-150 text-sm font-medium ${
                                        index !== menuItems.length - 1 ? 'border-b border-theme-border/50' : ''
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {getIcon(item.icon)}
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {view === 'prompts' && (
                        <div className="bg-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border shadow-2xl rounded-2xl overflow-hidden w-[300px] max-h-[400px] flex flex-col">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-theme-border/50 flex items-center justify-between bg-theme-bg-secondary">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setView('menu');
                                    }}
                                    className="text-theme-text-secondary hover:text-theme-text-primary p-1 -ml-1 rounded-lg hover:bg-theme-hover transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="text-sm font-semibold text-theme-text-primary">Saved Prompts</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setView('newPrompt');
                                    }}
                                    className="text-theme-accent hover:text-theme-accent/80 p-1 -mr-1 rounded-lg hover:bg-theme-hover transition-all"
                                    title="New Prompt"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Prompts List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {prompts.length === 0 ? (
                                    <div className="text-center py-8 text-theme-text-secondary text-sm">
                                        No saved prompts yet
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {prompts.map((prompt) => (
                                            <div
                                                key={prompt.id}
                                                className="group p-3 rounded-xl hover:bg-theme-hover transition-all cursor-pointer relative"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePromptClick(prompt.content);
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-theme-text-primary truncate">{prompt.title}</h4>
                                                        <p className="text-xs text-theme-text-secondary line-clamp-2 mt-0.5">{prompt.content}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDeletePrompt(prompt.id, e)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-theme-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'newPrompt' && (
                        <div className="bg-theme-bg-secondary/95 backdrop-blur-xl border border-theme-border shadow-2xl rounded-2xl overflow-hidden w-[300px]">
                            {/* Header */}
                            <div className="px-4 py-3 border-b border-theme-border/50 flex items-center gap-3 bg-theme-bg-secondary">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setView('prompts');
                                    }}
                                    className="text-theme-text-secondary hover:text-theme-text-primary p-1 -ml-1 rounded-lg hover:bg-theme-hover transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <span className="text-sm font-semibold text-theme-text-primary">New Prompt</span>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSavePrompt} className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={newPromptTitle}
                                    onChange={(e) => setNewPromptTitle(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onKeyUp={(e) => e.stopPropagation()}
                                    onKeyPress={(e) => e.stopPropagation()}
                                    placeholder="Title"
                                    className="w-full px-3 py-2 bg-theme-hover/50 border border-theme-border rounded-lg text-sm text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all"
                                    autoFocus
                                />
                                <textarea
                                    value={newPromptContent}
                                    onChange={(e) => setNewPromptContent(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onKeyUp={(e) => e.stopPropagation()}
                                    onKeyPress={(e) => e.stopPropagation()}
                                    placeholder="Prompt content..."
                                    className="w-full px-3 py-2 bg-theme-hover/50 border border-theme-border rounded-lg text-sm text-theme-text-primary placeholder:text-theme-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent transition-all resize-none h-24"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setView('prompts');
                                        }}
                                        className="flex-1 px-3 py-2 text-sm font-medium text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-hover rounded-lg transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newPromptTitle.trim() || !newPromptContent.trim()}
                                        className="flex-1 px-3 py-2 text-sm font-medium bg-theme-accent text-white rounded-lg hover:bg-theme-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TODO: Themes feature - uncomment when ready */}
                    {/* {view === 'themes' && (
                        <ThemeSelector
                            themes={themeList}
                            currentThemeId={themeId}
                            onSelectTheme={changeTheme}
                            onBack={() => setView('menu')}
                        />
                    )} */}
                </div>
            )}

            {/* Main FAB Button */}
            <button
                onClick={handleToggle}
                className={`w-8 h-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center overflow-hidden ${
                    isOpen ? 'rotate-45' : ''
                }`}
                title="ChatGPT Pro Tools"
            >
                <img
                    src={chrome.runtime.getURL('icon-48.png')}
                    alt="ChatGPT Pro Tool"
                    className="w-full h-full object-cover"
                />
            </button>
        </div>
    );
};

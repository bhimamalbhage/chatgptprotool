import React, { useState } from 'react';
import { Button } from '../../../shared/components/Button';
import { savePrompt } from '../storage';
import type { Prompt } from '../types';

interface SavePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialContent?: string;
}

export const SavePromptModal: React.FC<SavePromptModalProps> = ({ isOpen, onClose, onSave, initialContent = '' }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(initialContent);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        const newPrompt: Prompt = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: Date.now(),
        };

        await savePrompt(newPrompt);
        setTitle('');
        setContent('');
        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ring-1 ring-gray-200 scale-100 animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-sm font-semibold text-gray-900">New Prompt</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-900 ml-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-500"
                            placeholder="e.g., Code Review"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-900 ml-1">Prompt Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none h-32 resize-none placeholder:text-gray-500 leading-relaxed"
                            placeholder="Enter the prompt text here..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} size="sm">Cancel</Button>
                        <Button type="submit" size="sm" className="shadow-sm">Save Prompt</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


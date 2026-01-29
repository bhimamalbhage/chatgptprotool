import React from 'react';
import type { Prompt } from '../types';
import { Button } from '../../../shared/components/Button';


interface PromptListProps {
    prompts: Prompt[];
    onUse: (content: string) => void;
    onDelete: (id: string) => void;
}

export const PromptList: React.FC<PromptListProps> = ({ prompts, onUse, onDelete }) => {
    if (prompts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                No saved prompts yet.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {prompts.map((prompt) => (
                <div key={prompt.id} className="group p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 relative">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-sm text-gray-900 leading-tight">{prompt.title}</h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-lg p-0.5 shadow-sm border border-gray-100">
                            <Button variant="ghost" size="sm" onClick={() => onDelete(prompt.id)} title="Delete" className="text-gray-400 hover:text-red-600 h-6 w-6 p-0 flex items-center justify-center rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{prompt.content}</p>
                    <Button variant="secondary" size="sm" onClick={() => onUse(prompt.content)} className="w-full h-8 text-xs font-medium bg-gray-50 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 transition-colors">
                        Use Prompt
                    </Button>
                </div>
            ))}
        </div>
    );
};

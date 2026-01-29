import { useState } from 'react';
import type { Prompt } from './features/prompts/types';
import { PromptList } from './features/prompts/components/PromptList';
import { SavePromptModal } from './features/prompts/components/SavePromptModal';
import { Button } from './shared/components/Button';
import { useStorage } from './shared/hooks/useStorage';
import { STORAGE_KEY, deletePrompt } from './features/prompts/storage';

export default function App() {
  const { value: prompts, loading } = useStorage<Prompt[]>(STORAGE_KEY, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUsePrompt = async (content: string) => {
    // Send message to content script to insert text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'INSERT_PROMPT', content });
        window.close(); // Close popup after use
      } catch (error) {
        console.error("Could not send message to tab", error);
        alert("Could not insert prompt. Make sure you are on a ChatGPT page.");
      }
    } else {
      // Copy to clipboard as fallback logic if not in extension context or no tab
      navigator.clipboard.writeText(content);
      alert("Prompt copied to clipboard!");
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt(id);
    }
  };


  return (
    <div className="w-[400px] h-[500px] bg-theme-bg flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-theme-text selection:bg-theme-accent selection:text-theme-accent-text transition-colors duration-300">
      {/* Header with glass effect */}
      <header className="px-5 py-4 flex flex-col gap-4 sticky top-0 z-10 backdrop-blur-xl bg-theme-bg/70 border-b border-theme-border supports-[backdrop-filter]:bg-theme-bg/60">
        <div className="flex justify-between items-center">
          <h1 className="text-sm font-semibold text-theme-text flex items-center gap-2 tracking-tight">
            <span className="text-lg">🤖</span>
            ChatGPT Pro
          </h1>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="shadow-none border border-transparent bg-theme-accent text-theme-accent-text hover:brightness-110 hover:shadow-sm">
            New Prompt
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scrollbar-thumb-theme-border hover:scrollbar-thumb-theme-text-secondary">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-400 gap-2">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
            <span className="text-xs font-medium">Loading...</span>
          </div>
        ) : (
          <PromptList
            prompts={prompts || []}
            onUse={handleUsePrompt}
            onDelete={handleDeletePrompt}
          />
        )}
      </main>

      {/* Modern Modal Overlay */}
      <SavePromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => { }}
      />
    </div>
  );
}

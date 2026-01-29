
import React, { useEffect } from 'react';

export const ScrollControls: React.FC = () => {
    // const [visible, setVisible] = useState(false);
    // const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

    // Helper to find the best scroll container candidate using heuristics
    const getBestScrollContainer = () => {
        // Find all potential scrollable elements
        const allElements = document.querySelectorAll('*');
        let bestCandidate: HTMLElement | null = null;
        let maxArea = 0;

        for (const el of Array.from(allElements)) {
            const style = window.getComputedStyle(el);
            if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
                const rect = el.getBoundingClientRect();
                // Check if it's visible and substantial (at least 30% of screen height)
                if (rect.height > window.innerHeight * 0.3 && rect.width > 300) {
                    const area = rect.height * rect.width;
                    if (area > maxArea) {
                        maxArea = area;
                        bestCandidate = el as HTMLElement;
                    }
                }
            }
        }

        if (bestCandidate) {
            console.log("Found best scroll container via heuristic:", bestCandidate);
            return bestCandidate;
        }

        // Fallback to documentElement if it scrolls
        if (document.documentElement.scrollHeight > document.documentElement.clientHeight) {
            console.log("Using document.documentElement");
            return document.documentElement;
        }

        console.warn("No scroll container found");
        return null; // Don't return default, return null to handle correctly
    };

    const scrollToTop = () => {
        const container = getBestScrollContainer();
        if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Last resort
        }
    };

    const scrollToBottom = () => {
        const container = getBestScrollContainer();
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    };

    // Restore visibility logic with a periodic check to find the container
    useEffect(() => {
        let activeContainer = getBestScrollContainer();

        const handleScroll = () => {
            // Logic for visibility tracking removed for debugging
        };

        // Try to attach scroll listener to the best candidate
        const attachListener = () => {
            const newContainer = getBestScrollContainer();
            if (newContainer !== activeContainer) {
                const oldTarget = activeContainer === document.documentElement ? window : activeContainer;
                if (oldTarget) oldTarget.removeEventListener('scroll', handleScroll);

                activeContainer = newContainer;
                // If activeContainer is null, we can't attach, but check again later
                if (activeContainer) {
                    const newTarget = activeContainer === document.documentElement ? window : activeContainer;
                    if (newTarget) newTarget.addEventListener('scroll', handleScroll);
                }
            }
        };

        const interval = setInterval(attachListener, 2000); // Re-check every 2s in case DOM changes
        attachListener();

        return () => {
            clearInterval(interval);
            if (activeContainer) {
                const target = activeContainer === document.documentElement ? window : activeContainer;
                if (target) target.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    // if (!visible) return null; // Commented out for debugging visibility

    return (
        // pointer-events-auto ensures buttons are clickable, while parent (rootDiv) is pointer-events-none
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 animate-in fade-in duration-300 pointer-events-auto">
            <div className="flex flex-col bg-theme-bg-secondary/90 backdrop-blur-md border border-theme-border shadow-lg rounded-full overflow-hidden p-1 space-y-1 ring-1 ring-black/5">
                <button
                    onClick={scrollToTop}
                    className="p-2 text-theme-text-secondary hover:text-theme-accent hover:bg-theme-hover rounded-full transition-all duration-200 active:scale-95 group"
                    title="Scroll to Top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </button>
                <div className="h-px w-full bg-theme-border/50"></div>
                <button
                    onClick={scrollToBottom}
                    className="p-2 text-theme-text-secondary hover:text-theme-accent hover:bg-theme-hover rounded-full transition-all duration-200 active:scale-95 group"
                    title="Scroll to Bottom"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get(key, (result) => {
                if (result[key]) {
                    setValue(result[key] as T);
                }
                setLoading(false);
            });

            const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
                if (changes[key]) {
                    setValue(changes[key].newValue as T);
                }
            };

            chrome.storage.onChanged.addListener(handleChange);
            return () => {
                chrome.storage.onChanged.removeListener(handleChange);
            };
        } else {
            // Fallback for development outside extension
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    setValue(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse local storage", e);
                }
            }
            setLoading(false);
        }
    }, [key]);

    const setStoredValue = async (newValue: T) => {
        setValue(newValue);
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ [key]: newValue });
        } else {
            localStorage.setItem(key, JSON.stringify(newValue));
        }
    };

    return { value, setValue: setStoredValue, loading };
}

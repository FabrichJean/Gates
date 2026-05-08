import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import VideoPlayer from "./VideoPlayer";

interface UrlVideoModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (value: string) => void;
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  helperText?: string;
  videoSlot?: ReactNode;
  disabled?: boolean;
  closeOnOverlay?: boolean;
}

export default function UrlVideoModal({
  open,
  onClose,
  onSubmit,
  title = "Check URL Video",
  placeholder = "https://...",
  submitLabel = "Valider",
  value,
  onValueChange,
  helperText,
  videoSlot,
  disabled = false,
  closeOnOverlay = true,
}: UrlVideoModalProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState("xokey");
  const [keySuggestions, setKeySuggestions] = useState<string[]>([
    "xokey",
    "fsjkey",
  ]);
  const [isKeyOpen, setIsKeyOpen] = useState(false);
  const [highlightedKeyIndex, setHighlightedKeyIndex] = useState(-1);
  const keyBlurTimeoutRef = useRef<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null);
      setSubmitError(null);
      setPreviewKey("xokey");
      setIsKeyOpen(false);
      setHighlightedKeyIndex(-1);
      if (keyBlurTimeoutRef.current !== null) {
        window.clearTimeout(keyBlurTimeoutRef.current);
        keyBlurTimeoutRef.current = null;
      }
      if (value === undefined) {
        setInternalValue("");
      }
    }
  }, [open, value]);

  useEffect(() => {
    return () => {
      if (keyBlurTimeoutRef.current !== null) {
        window.clearTimeout(keyBlurTimeoutRef.current);
      }
    };
  }, []);

  if (!open) return null;

  const currentValue = value !== undefined ? value : internalValue;
  const normalizedKeyQuery = previewKey.trim().toLowerCase();
  const filteredKeySuggestions = keySuggestions.filter((key) =>
    key.toLowerCase().includes(normalizedKeyQuery)
  );
  const hasExactKey = keySuggestions.some(
    (key) => key.toLowerCase() === normalizedKeyQuery
  );
  const keyOptions = normalizedKeyQuery
    ? hasExactKey
      ? filteredKeySuggestions
      : [previewKey.trim(), ...filteredKeySuggestions]
    : keySuggestions;

  const handleChange = (nextValue: string) => {
    if (onValueChange) {
      onValueChange(nextValue);
      if (previewUrl) setPreviewUrl(null);
      return;
    }
    if (previewUrl) setPreviewUrl(null);
    setInternalValue(nextValue);
  };

  const registerKeySuggestion = (nextKey: string) => {
    const trimmed = nextKey.trim();
    if (!trimmed) return;
    setKeySuggestions((prev) => {
      const exists = prev.some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prev;
      return [...prev, trimmed];
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    const trimmed = currentValue.trim();
    if (!trimmed) {
      setSubmitError("URL requise");
      return;
    }
    setSubmitError(null);
    registerKeySuggestion(previewKey);
    setPreviewUrl(trimmed);
    setIsKeyOpen(false);
    setHighlightedKeyIndex(-1);
    if (keyBlurTimeoutRef.current !== null) {
      window.clearTimeout(keyBlurTimeoutRef.current);
      keyBlurTimeoutRef.current = null;
    }
    onSubmit?.(trimmed);
  };

  const handleKeyChange = (nextKey: string) => {
    setPreviewKey(nextKey);
    setIsKeyOpen(true);
    setHighlightedKeyIndex(-1);
    if (previewUrl) setPreviewUrl(null);
  };

  const handleKeyOptionSelect = (nextKey: string) => {
    setPreviewKey(nextKey);
    registerKeySuggestion(nextKey);
    setIsKeyOpen(false);
    setHighlightedKeyIndex(-1);
    if (previewUrl) setPreviewUrl(null);
  };

  const handleKeyInputBlur = (nextValue: string) => {
    registerKeySuggestion(nextValue);
    if (keyBlurTimeoutRef.current !== null) {
      window.clearTimeout(keyBlurTimeoutRef.current);
    }
    keyBlurTimeoutRef.current = window.setTimeout(() => {
      setIsKeyOpen(false);
      setHighlightedKeyIndex(-1);
    }, 120);
  };

  const handleKeyInputFocus = () => {
    if (keyBlurTimeoutRef.current !== null) {
      window.clearTimeout(keyBlurTimeoutRef.current);
      keyBlurTimeoutRef.current = null;
    }
    setIsKeyOpen(true);
  };

  const handleKeyInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!keyOptions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsKeyOpen(true);
      setHighlightedKeyIndex((prev) =>
        Math.min(prev + 1, keyOptions.length - 1)
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsKeyOpen(true);
      setHighlightedKeyIndex((prev) => Math.max(prev - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (isKeyOpen && highlightedKeyIndex >= 0) {
        event.preventDefault();
        const selected = keyOptions[highlightedKeyIndex];
        if (selected) handleKeyOptionSelect(selected);
      } else {
        registerKeySuggestion(previewKey);
        setIsKeyOpen(false);
        setHighlightedKeyIndex(-1);
      }
      return;
    }
    if (event.key === "Escape") {
      setIsKeyOpen(false);
      setHighlightedKeyIndex(-1);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => {
          if (closeOnOverlay && !disabled) onClose();
        }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              disabled={disabled}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
              <label
                htmlFor="url-video-input"
                className="text-xs text-gray-600 dark:text-gray-300 min-w-[48px] flex items-center"
              >
                URL
              </label>
              <input
                id="url-video-input"
                type="url"
                value={currentValue}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                disabled={disabled}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition disabled:opacity-50"
                disabled={disabled}
              >
                {submitLabel}
              </button>
            </form>

            <div className="flex items-start gap-2">
              <label
                htmlFor="url-video-key-input"
                className="text-xs text-gray-600 dark:text-gray-300 min-w-[48px]"
              >
                Key
              </label>
              <div className="relative flex-1">
                <input
                  id="url-video-key-input"
                  type="text"
                  value={previewKey}
                  onChange={(event) => handleKeyChange(event.target.value)}
                  onFocus={handleKeyInputFocus}
                  onBlur={(event) => handleKeyInputBlur(event.target.value)}
                  onKeyDown={handleKeyInputKeyDown}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={disabled}
                  role="combobox"
                  aria-expanded={isKeyOpen}
                  aria-controls="url-video-key-listbox"
                />
                {isKeyOpen && keyOptions.length > 0 && (
                  <ul
                    id="url-video-key-listbox"
                    role="listbox"
                    className="absolute z-20 mt-1 w-full rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-40 overflow-auto"
                  >
                    {keyOptions.map((key, index) => (
                      <li key={`${key}-${index}`} role="option">
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleKeyOptionSelect(key);
                          }}
                          onMouseEnter={() => setHighlightedKeyIndex(index)}
                          className={`w-full text-left px-3 py-2 text-sm transition ${
                            highlightedKeyIndex === index
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          {key}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {submitError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {submitError}
              </p>
            )}

            {helperText && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}

            <div className="aspect-video w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              {videoSlot ?? (
                <div className="w-full h-full">
                  {previewUrl ? (
                    <VideoPlayer
                      videoUrls={{ hlsUrl: previewUrl, key: previewKey }}
                      className="w-full h-full"
                      autoPlay
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Apercu video
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

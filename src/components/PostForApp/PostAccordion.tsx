import React, { useEffect, useMemo, useRef, useState } from "react";
import TitlesEditor from "../../pages/PostEdit/components/TitlesEditor";
import useUpdatePostForApp from "../../hooks/useUpdatePostForApp";
import toast from "react-hot-toast";
import config from "../../config/environment";

const OLLAMA_URL = config.ollama.apiUrl;
const OLLAMA_MODEL = config.ollama.model;

function buildDescriptionPrompt(title: string, language: string): string {
  return `You are a blogger of sex social media writer. Your task is to write a HIGH SEXUAL attractive description for a post.

Post title: "${title}"
Target language: ${language}

Instructions:
- Write ONLY the description text, nothing else — no preamble, no label, no explanation
- The description must be in the same language as the title (language code: ${language})
- Length: 2 sentences.
- Tone: professional yet accessible
- Do NOT repeat the title verbatim; instead, expand on it naturally
- Do NOT include hashtags, emojis, or promotional language

Description:`;
}

interface SuggestionBoxProps {
  title: string;
  languageCode: string;
  onApply: (text: string) => void;
}

function SuggestionBox({ title, languageCode, onApply }: SuggestionBoxProps) {
  const [streaming, setStreaming] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!title.trim()) return;

    // Reset state
    setSuggestion("");
    setError(null);
    setDone(false);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: buildDescriptionPrompt(title, languageCode),
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;

        const chunk = decoder.decode(value, { stream: true });
        // Each line is a JSON object
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              setSuggestion((prev) => prev + parsed.response);
            }
            if (parsed.done) {
              setDone(true);
            }
          } catch {
            // Partial JSON line, skip
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error(err);
      setError("Impossible de contacter Ollama. Vérifiez que le service est actif.");
    } finally {
      setStreaming(false);
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setDone(true);
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  if (!title.trim()) return null;

  return (
    <div className="mt-2 rounded-md border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Suggestion IA
        </span>
        <div className="flex items-center gap-2">
          {!streaming && (
            <button
              onClick={generate}
              className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors"
            >
              {suggestion ? "↺ Régénérer" : "✦ Générer"}
            </button>
          )}
          {streaming && (
            <button
              onClick={stop}
              className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
            >
              ■ Arrêter
            </button>
          )}
          {suggestion && done && !streaming && (
            <button
              onClick={() => onApply(suggestion.trim())}
              className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
            >
              ✓ Appliquer
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      {(suggestion || streaming) && !error && (
        <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed min-h-[2.5rem]">
          {suggestion}
          {streaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-400 animate-pulse align-middle rounded-sm" />
          )}
        </div>
      )}

      {!suggestion && !streaming && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          Cliquez sur « Générer » pour obtenir une suggestion basée sur le titre.
        </p>
      )}
    </div>
  );
}

export default function PostAccordion({
  post,
  updated: updatedProp,
  onMarkedUpdated,
  isOpen: isOpenProp,
  setOpen: setOpenProp,
  onOpenNext,
}: {
  post: any;
  updated?: boolean;
  onMarkedUpdated?: (id: number) => void;
  isOpen?: boolean;
  setOpen?: (v: boolean) => void;
  onOpenNext?: (id: number) => void;
}) {
  const [openLocal, setOpenLocal] = useState(false);

  const [languages, setLanguages] = useState<{ id: number; name: string; code: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{ id: number; name: string; code: string } | null>(null);
  const [titles, setTitles] = useState<{ [key: number]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});

  const { updatePostForApp, loading: updating } = useUpdatePostForApp();
  const [updated, setUpdated] = useState(false);
  const timerRef = useRef<number | null>(null);

  const isUpdated = typeof updatedProp === "boolean" ? updatedProp : updated;

  useEffect(() => {
    const pts = post?.titles || [];
    if (!Array.isArray(pts) || pts.length === 0) {
      setLanguages([]);
      setSelectedLanguage(null);
      setTitles({});
      setDescriptions({});
      return;
    }

    const langs = pts.map((t: any, idx: number) => {
      const code = t.i18_language || t.language || t.code || `lang_${idx}`;
      return { id: idx + 1, name: String(code).toUpperCase(), code };
    });

    const tmap: { [key: number]: string } = {};
    const dmap: { [key: number]: string } = {};
    langs.forEach((l, idx) => {
      const src = pts[idx] || {};
      tmap[l.id] = src.title || "";
      dmap[l.id] = src.description || "";
    });

    setLanguages(langs);
    setSelectedLanguage(langs[0] || null);
    setTitles(tmap);
    setDescriptions(dmap);
  }, [post]);

  const handleTitleChange = (languageId: number, value: string) => {
    setTitles((prev) => ({ ...prev, [languageId]: value }));
  };

  const handleDescriptionChange = (languageId: number, value: string) => {
    setDescriptions((prev) => ({ ...prev, [languageId]: value }));
  };

  const handleSaveTitles = async () => {
    if (!post?.id) return;
    const payloadTitles = languages.map((l) => ({
      i18_language: l.code,
      title: titles[l.id] || "",
      description: descriptions[l.id] || "",
    }));

    try {
      await updatePostForApp(post.id, { titles: payloadTitles });
      toast.success("Titles updated");
      post.titles = payloadTitles;
      if (onMarkedUpdated) {
        onMarkedUpdated(post.id);
        if (onOpenNext) onOpenNext(post.id);
        else setOpenLocal((v) => !v);
      } else {
        setUpdated(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setUpdated(false);
          timerRef.current = null;
        }, 3000) as unknown as number;
        if (onOpenNext) onOpenNext(post.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update titles");
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const hasTitles = languages.length > 0;
  const isOpen = typeof isOpenProp === "boolean" ? isOpenProp : openLocal;

  // Determine which language entries have an empty description — for suggestion display
  const languagesWithEmptyDesc = languages.filter((l) => !descriptions[l.id]?.trim());

  return (
    <div className="py-2">
      <button
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-sm font-medium">
            #{post.id}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {post.title || post.creator || post.id}
              </div>
              {isUpdated && (
                <span className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  updated
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {post.postCategory?.name || "-"} • {post.plateform?.name || "-"}
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            if (typeof isOpenProp === "boolean" && setOpenProp) setOpenProp(!isOpenProp);
            else setOpenLocal((v) => !v);
          }}
          className="text-sm text-gray-500"
        >
          {isOpen ? "▲" : "▼"}
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md">
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-3">
            创建者: {post.creatorObj?.name || post.creator || "-"}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-3">
            创建日期: {post.createdAt ? new Date(post.createdAt).toLocaleString() : "-"}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-4">
            Videos: {post.videos?.length || 0} — Images: {post.images?.length || 0}
          </div>

          {hasTitles ? (
            <div className="mb-4">
              <TitlesEditor
                languages={languages}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                titles={titles}
                descriptions={descriptions}
                handleTitleChange={handleTitleChange}
                handleDescriptionChange={handleDescriptionChange}
                setShowAddLanguageModal={() =>
                  toast("Add language from edit view not supported")
                }
                handleRemoveLanguage={(languageId: number) => {
                  setLanguages((prev) => prev.filter((l) => l.id !== languageId));
                  setTitles((prev) => {
                    const copy = { ...prev };
                    delete copy[languageId];
                    return copy;
                  });
                  setDescriptions((prev) => {
                    const copy = { ...prev };
                    delete copy[languageId];
                    return copy;
                  });
                  setSelectedLanguage((prev) => {
                    const remaining = languages.filter((l) => l.id !== languageId);
                    return remaining.length > 0 ? remaining[0] : null;
                  });
                }}
              />

              {/* ── AI Suggestion boxes for languages with empty description ── */}
              {languagesWithEmptyDesc.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold">
                    Descriptions manquantes — suggestions IA
                  </p>
                  {languagesWithEmptyDesc.map((lang) => (
                    <div key={lang.id}>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        [{lang.name}] — {titles[lang.id] || "(sans titre)"}
                      </p>
                      <SuggestionBox
                        title={titles[lang.id] || ""}
                        languageCode={lang.code}
                        onApply={(text) => {
                          handleDescriptionChange(lang.id, text);
                          toast.success(`Description appliquée pour ${lang.name}`);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-3">
                <button
                  onClick={handleSaveTitles}
                  disabled={updating}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updating ? "保存中..." : "保存标题"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">无标题可编辑</div>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useMemo, useRef, useState } from "react";
import TitlesEditor from "../../pages/PostEdit/components/TitlesEditor";
import useUpdatePostForApp from "../../hooks/useUpdatePostForApp";
import toast from "react-hot-toast";

export default function PostAccordion({ post, updated: updatedProp, onMarkedUpdated, isOpen: isOpenProp, setOpen: setOpenProp, onOpenNext }: { post: any; updated?: boolean; onMarkedUpdated?: (id: number) => void; isOpen?: boolean; setOpen?: (v: boolean)=>void; onOpenNext?: (id: number)=>void }) {
  const [openLocal, setOpenLocal] = useState(false);

  // Local editable title/description state per post
  const [languages, setLanguages] = useState<{ id: number; name: string; code: string }[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<{ id: number; name: string; code: string } | null>(null);
  const [titles, setTitles] = useState<{ [key: number]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});

  const { updatePostForApp, loading: updating } = useUpdatePostForApp();
  const [updated, setUpdated] = useState(false);
  const timerRef = useRef<number | null>(null);

  // If parent provides updated state, prefer that. Otherwise fall back to local `updated`.
  const isUpdated = typeof updatedProp === "boolean" ? updatedProp : updated;

  // Initialize local language/title state from post.titles when post changes
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
    // Build payload expected by backend: array of { i18_language, title, description }
    const payloadTitles = languages.map((l) => ({
      i18_language: l.code,
      title: titles[l.id] || "",
      description: descriptions[l.id] || "",
    }));

    try {
      await updatePostForApp(post.id, { titles: payloadTitles });
      toast.success("Titles updated");
      // update local post.titles so UI reflects save
      post.titles = payloadTitles;
      // If parent manages updated badges, notify it; otherwise manage local badge
      if (onMarkedUpdated) {
        onMarkedUpdated(post.id);
        // if parent controls open state, ask parent to open next accordion
        if (onOpenNext) onOpenNext(post.id);
        else {
          // otherwise toggle local open state
          setOpenLocal((v) => !v);
        }
      } else {
        setUpdated(true);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setUpdated(false);
          timerRef.current = null;
        }, 3000) as unknown as number;
        // when local-handled, also open next if requested
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
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.title || post.creator || post.id}</div>
              {isUpdated && (
                <span className="text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">updated</span>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{post.postCategory?.name || "-"} • {post.plateform?.name || "-"}</div>
          </div>
        </div>
        <div onClick={() => {
            // toggle controlled or local open state
            if (typeof isOpenProp === 'boolean' && setOpenProp) setOpenProp(!isOpenProp);
            else setOpenLocal(v => !v);
          }} className="text-sm text-gray-500">{(typeof isOpenProp === 'boolean' ? isOpenProp : openLocal) ? "▲" : "▼"}</div>
      </button>
  {(typeof isOpenProp === 'boolean' ? isOpenProp : openLocal) && (
        <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md">
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-3">创建者: {post.creatorObj?.name || post.creator || "-"}</div>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-3">创建日期: {post.createdAt ? new Date(post.createdAt).toLocaleString() : "-"}</div>
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-4">Videos: {post.videos?.length || 0} — Images: {post.images?.length || 0}</div>

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
                setShowAddLanguageModal={() => toast("Add language from edit view not supported")}
                handleRemoveLanguage={(languageId: number) => {
                  // simple removal from local state
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

              <div className="flex justify-end mt-3">
                <button onClick={handleSaveTitles} disabled={updating} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
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

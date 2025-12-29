// pages/PostCategoryManager.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import useCategoryPost from "../hooks/posts/useCategoryPost";
import {
  createPostCategoryApi,
  deletePostCategoryApi,
} from "../api/postCategories";

import PostCategoryCard from "../components/PostCategoryCard";
import PostSubCategoryPanel from "../components/PostSubCategoryPanel";
import Pagination from "../components/Pagination2";
import ViewToggle from "../components/ViewToggle";
import SearchInput from "../components/SearchInput";
import SkeletonCards from "../components/SkeletonCards";

const NON_SPACE_LIMIT = 324;
const PER_PAGE = 6;

export default function PostCategoryManager() {
  const { data, isLoading, reFetch } = useCategoryPost();
  const categories = data?.categories ?? [];

  /* ---------- états ---------- */
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newCat, setNewCat] = useState("");
  const [newCreator, setNewCreator] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  /* ---------- filtres ---------- */
  const filtered = useMemo(() => {
    if (!query) return categories;
    const q = query.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  /* ---------- gestion caractères ---------- */
  const handleNewCatChange = (value: string) => {
    const nonSpaceCount = value.replace(/\s/g, "").length;
    if (nonSpaceCount <= NON_SPACE_LIMIT) {
      setNewCat(value);
      return;
    }
    let count = 0;
    let out = "";
    for (const ch of value) {
      if (/\s/.test(ch)) out += ch;
      else if (count < NON_SPACE_LIMIT) {
        out += ch;
        count++;
      }
    }
    setNewCat(out);
  };

  /* ---------- CRUD ---------- */
  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    try {
      await createPostCategoryApi(name, newCreator.trim() || undefined);
      await reFetch();
      setNewCat("");
      setNewCreator("");
      toast.success("Catégorie ajoutée");
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const removeCategory = async (id: number) => {
    const category = categories.find((c) => c.id === id);
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la catégorie "${category?.name}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;
    
    try {
      await deletePostCategoryApi(id);
      if (selectedId === id) setSelectedId(null);
      await reFetch();
      toast.success("Catégorie supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedId) ?? null;

  /* ---------- rendu ---------- */
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ------ panneau gauche ------ */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            {/* en-tête */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Post categories
              </h1>
              <ViewToggle view={view} setView={setView} />
            </div>

            {/* ajout + recherche */}
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Rechercher une catégorie…"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => handleNewCatChange(e.target.value)}
                  placeholder="Nouvelle catégorie…"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={addCategory}
                  className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* creator optionnel */}
            <div className="mb-3">
              <input
                type="text"
                value={newCreator}
                onChange={(e) => setNewCreator(e.target.value)}
                placeholder="Créateur (optionnel)…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Max {NON_SPACE_LIMIT} caractères (hors espaces)
            </p>

            {/* loader */}
            {isLoading && <SkeletonCards cards={6} />}

            {/* grille / liste */}
            {!isLoading && (
              <>
                <div
                  className={
                    view === "grid"
                      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-3"
                  }
                >
                  <AnimatePresence>
                    {paginated.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PostCategoryCard
                          category={c}
                          isSelected={selectedId === c.id}
                          onSelect={() => setSelectedId(c.id)}
                          onDelete={() => removeCategory(c.id)}
                          onEdit={() => reFetch()}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {paginated.length === 0 && (
                  <p className="py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucune catégorie trouvée.
                  </p>
                )}

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              </>
            )}
          </div>
        </section>

        {/* ------ panneau droit : sous-catégories ------ */}
        <section>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <motion.div
                  key={selectedCategory.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <PostSubCategoryPanel category={selectedCategory} />
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center text-gray-500 dark:text-gray-400"
                >
                  Sélectionnez une catégorie pour afficher ses sous-catégories.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
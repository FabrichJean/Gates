import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getTagCategoriesVideoForAppApi,
} from "../api/videoForApp";
import toast from "react-hot-toast";
import { Plus, Tag, X } from "lucide-react";

interface TagCategoryVideoForAppProps {
  selectedTags: (number | { name: string })[];
  onTagSelect: (tag: number | { name: string }) => void;
  onTagDeselect: (tag: number | { name: string }) => void;
}

interface TagCategory {
  id?: number;
  name: string;
  type?: 'video' | 'videoapp';
}

interface SelectedTag {
  id?: number;
  name: string;
  isNew?: boolean;
}

const TagCategoryVideoForApp: React.FC<TagCategoryVideoForAppProps> = ({
  selectedTags,
  onTagSelect,
  onTagDeselect,
}) => {
  const [tagQuery, setTagQuery] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<TagCategory[]>([]);
  const [selectedTagCategories, setSelectedTagCategories] = useState<SelectedTag[]>([]);
  const [allTags, setAllTags] = useState<TagCategory[]>([]);

  const fetchAllTags = useCallback(async () => {
    try {
      const [videoTagsRes] = await Promise.all([
        getTagCategoriesVideoForAppApi()
      ]);

      const videoTags = (videoTagsRes?.data?.items ?? videoTagsRes?.data ?? []).map((tag: TagCategory) => ({
        ...tag,
        type: 'video' as const
      }));

      const combinedTags = videoTags;
      setAllTags(combinedTags);
    } catch (err) {
      console.error("Failed to load tags", err);
      toast.error("Unable to load tags");
    }
  }, []);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  useEffect(() => {
    // Update selectedTagCategories based on selectedTags
    const selected: SelectedTag[] = [];
    
    selectedTags.forEach(tag => {
      if (typeof tag === 'number') {
        // Existing tag by ID
        const existingTag = allTags.find(t => t.id === tag);
        if (existingTag) {
          selected.push({ ...existingTag, isNew: false });
        }
      } else {
        // New tag object
        selected.push({ ...tag, isNew: true });
      }
    });
    
    setSelectedTagCategories(selected);
  }, [selectedTags, allTags]);

  useEffect(() => {
    if (tagQuery.trim().length > 0) {
      const filtered = allTags.filter(tag => {
        // Check if tag is already selected
        const isSelected = selectedTags.some(selectedTag => {
          if (typeof selectedTag === 'number') {
            return selectedTag === tag.id;
          } else {
            return selectedTag.name.toLowerCase() === tag.name.toLowerCase();
          }
        });
        return tag.name.toLowerCase().includes(tagQuery.toLowerCase()) && !isSelected;
      });
      setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    } else {
      setSuggestions([]);
    }
  }, [tagQuery, allTags, selectedTags]);

  const addTagByName = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const exists = selectedTagCategories.find(
      (t) => t.name.toLowerCase() === n.toLowerCase()
    );
    if (exists) return;
    setSelectedTagCategories((s) => [...s, { name: n, }]);
    onTagSelect({ name: n });
    setTagQuery("");
  };

  const addSuggestion = (tag: TagCategory) => {
    if (tag.id) {
      // Check if this existing tag is already selected
      const isAlreadySelected = selectedTags.some(selectedTag => 
        typeof selectedTag === 'number' && selectedTag === tag.id
      );
      if (!isAlreadySelected) {
        onTagSelect(tag.id);
      }
    }
    setTagQuery("");
    setShowTagDropdown(false);
  };

  const removeSelectedTag = (index: number) => {
    const tagToRemove = selectedTagCategories[index];
    if (tagToRemove) {
      if (tagToRemove.id && !tagToRemove.isNew) {
        // Existing tag - remove by ID
        onTagDeselect(tagToRemove.id);
      } else {
        // New tag - remove by object
        onTagDeselect({ name: tagToRemove.name });
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => {
              setTagQuery(e.target.value);
              setShowTagDropdown(true);
            }}
            onFocus={() => {
              setShowTagDropdown(true);
              if (tagQuery.trim().length === 0) {
                // Show all available tags when focused and no query
                const availableTags = allTags.filter(tag => {
                  const isSelected = selectedTags.some(selectedTag => {
                    if (typeof selectedTag === 'number') {
                      return selectedTag === tag.id;
                    } else {
                      return selectedTag.name.toLowerCase() === tag.name.toLowerCase();
                    }
                  });
                  return !isSelected;
                });
                setSuggestions(availableTags.slice(0, 10));
              }
            }}
            onBlur={() => {
              // Delay hiding dropdown to allow clicking on suggestions
              setTimeout(() => setShowTagDropdown(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTagByName(tagQuery);
              }
            }}
            placeholder="Type tag name or select suggestion..."
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
          />
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => addTagByName(tagQuery)}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showTagDropdown && suggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className=" w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
          >
            {suggestions?.map((s, index) => (
              <motion.button
                key={s.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                type="button"
                onClick={() => {
                  addSuggestion(s);
                  setShowTagDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-gray-700 dark:text-gray-300"
              >
                {s.name}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap gap-2">
        <AnimatePresence>
          {selectedTagCategories.map((t, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
            >
              <Tag className="w-3 h-3" />
              <span>{t.name}</span>
              <button
                type="button"
                onClick={() => removeSelectedTag(i)}
                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TagCategoryVideoForApp;

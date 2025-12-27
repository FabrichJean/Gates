import { useEffect, useRef, useState } from "react";
import UseCreators from "../hooks/useCreators";

export type TAppFilter = {
  creator_id: string;
  creatorSearch?: string;
};

export default function VideoForAppFilter({
  onSubmit,
  params,
  filters,
  setFilters,
  scope = "videoForApp",
}: {
  params: any;
  filters: any;
  setFilters: any;
  onSubmit: (d: any) => void;
  scope?: "videoForApp";
}) {
  const { data: creators } = UseCreators();

  const [creatorOpen, setCreatorOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const creatorRef = useRef<HTMLDivElement>(null);

  // fermer dropdown creator au clic hors zone
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creatorRef.current && !creatorRef.current.contains(event.target as Node)) {
        setCreatorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  // Soumission des filtres
  const submit = async () => {
    // Map isDeleted to true/false
    let isDeletedValue: boolean | undefined = undefined;
    if (filters.isDeleted === "yes") isDeletedValue = true;
    else if (filters.isDeleted === "no") isDeletedValue = false;
    else isDeletedValue = undefined;

    let checkingValue: string | null | undefined = undefined;
    if (filters.checking === "all" || filters.checking === "" || !filters.checking) checkingValue = undefined;
    else checkingValue = filters.checking;

    const data = {
      ...filters,
      isDeleted: isDeletedValue,
      checking: checkingValue,
    };
    const safeParams = params || {};
    const finalQuery = { ...safeParams, ...data, page: '1' };
    try {
      const { fetchVideoForAppList } = await import("../api/videoForApp");
      const fetched = await fetchVideoForAppList(finalQuery);
      onSubmit(fetched.videos);
    } catch (error) {
      console.error("Erreur lors du filtrage :", error);
    }
  };

  const closeModal = () => {
    const modal = document.getElementById(
      "search_modal_52"
    ) as HTMLDialogElement | null;
    modal?.close();
    setHasInteracted(false);
    setCreatorOpen(false);
  };

  return (
    <dialog id="search_modal_52" className="modal">
      <div className="flex flex-col gap-4 modal-box w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        {/* Sélections principales */}

        {/* Filtres booléens */}
        <div className="flex flex-col gap-4">
          {/* Deleted filter */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Deleted</p>
            <div className="flex gap-3">
              {['all', 'yes', 'no'].map((option) => (
                <label key={option} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="isDeleted"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option === 'all'
                        ? (filters.isDeleted === 'all' || filters.isDeleted === '')
                        : filters.isDeleted === option
                    }
                    onChange={() => handleChange('isDeleted', option)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Checking filter */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Checking</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'all', label: 'all' },
                { value: 'null', label: 'not ready' },
                { value: 'waiting for checking', label: 'ready' },
                { value: 'refused', label: 'refused' },
                { value: 'checked', label: 'checked' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="checking"
                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                    checked={
                      option.value === 'all'
                        ? (filters.checking === 'all' || filters.checking === '' || !filters.checking)
                        : filters.checking === option.value
                    }
                    onChange={() => handleChange('checking', option.value)}
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>


        <div className="flex flex-col gap-6">
          {/* Creator searchable */}
          <div ref={creatorRef} className="relative">
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Creator</label>
            <input
              type="text"
              placeholder="Search creator..."
              value={filters.creatorSearch || ""}
              onChange={(e) => {
                const value = e.target.value;
                setHasInteracted(true);
                if (value === "") {
                  handleChange("creatorSearch", "");
                  handleChange("creator_id", "");
                } else {
                  handleChange("creatorSearch", value);
                }
              }}
              onFocus={() => setCreatorOpen(true)}
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition"
            />
            {creatorOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                <div
                  className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                  onClick={() => {
                    handleChange("creator_id", "");
                    handleChange("creatorSearch", "");
                    setCreatorOpen(false);
                  }}
                >
                  all
                </div>
                {(!creators || creators.length === 0) && (
                  <div className="px-3 py-2 text-gray-500">No creators found</div>
                )}
                {creators
                  ?.filter((c: any) =>
                    c.name?.toLowerCase().includes((filters.creatorSearch || "").toLowerCase())
                  )
                  .map((c: any) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                      onClick={() => {
                        handleChange("creator_id", String(c.id));
                        handleChange("creatorSearch", c.name);
                        setCreatorOpen(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <form method="dialog" className="pt-3 flex justify-end gap-3">
          <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">Close</button>
          <div
            className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
            onClick={async () => {
              setFilters({
                creator_id: "",
                creatorSearch: "",
                isDeleted: "all",
                checking: "all",
              });
              setHasInteracted(false);
              setCreatorOpen(false);
              await submit();
            }}
          >
            Reset
          </div>
          <button
            className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
            onClick={(e) => {
              e.preventDefault();
              submit();
              closeModal();
            }}
          >
            Apply
          </button>
        </form>
      </div>
    </dialog>
  );
}

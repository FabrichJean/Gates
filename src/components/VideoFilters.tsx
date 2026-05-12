/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { useUsers, useAuthMe } from "../hooks/useAuth";
import UseCategory from "../hooks/useCategory";
import UseSubCategory from "../hooks/useSubCategory";
import { mapStatus, mapStatusProcessing, reverseStatus } from "../utils/filter";
import CreatorAutoComplete from "./CreatorAutoComplete";
import type { Creator } from "./creators/CreatorList";
import { useI18n } from "../i18n";
import RoleEnum from "../utils/roleEnum";

export type TFilter = {
    category_id: string;
    sub_category_id: string;
    user_id: string;
    creator_id: string;
    creatorSearch?: string;
    keyword?: string;
    tagCategory?: string;
    isDeleted: string;
    processing: string;
    startedAt: string;
    endAt: string;
    accessing?: string;
};

export default function VideoFilters({
    onSubmit,
    params,
    filters,
    setFilters,
    scope = "videos",
}: {
    params: any;
    filters: any;
    setFilters: any;
    onSubmit: (d: any) => void;
    scope?: "videos" | "bot";
}) {
    const { t } = useI18n();
    const { data: user } = useAuthMe();
    const { data: users } = useUsers("");
    const { data: cat } = UseCategory();
    const { data: subcat } = UseSubCategory(Number(filters?.category_id));

    // Chargement des filtres sauvegardés
    useEffect(() => {
        try {
            const saved = localStorage.getItem("videos_filtered");
            if (!saved) return;

            const savedFilter = JSON.parse(saved);

            const _ = {
                ...savedFilter,
                isDeleted: reverseStatus(savedFilter.isDeleted),
                processing: savedFilter.processing,
                startedAt: savedFilter.startedAt || "",
                endAt: savedFilter.endAt || "",
                accessing: savedFilter.accessing || "",
                tagCategory: savedFilter.tagCategory || "",
                // restore creatorSearch if present
                creatorSearch: savedFilter.creatorSearch || savedFilter.creator || "",
                // restore keyword
                keyword: savedFilter.keyword || "",
            };

            setFilters(_);
        } catch (e) {
            console.warn("⚠️ Impossible de lire le filtre sauvegardé :", e);
            localStorage.removeItem("videos_filtered");
        }
    }, []);

    const handleChange = useCallback((key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
    }, []);

    const handleCreatorChange = useCallback((value: string | null) => {
        handleChange("creatorSearch", value || "");
        if (!value) {
            handleChange("creator_id", "");
        }
    }, [handleChange]);

    const handleCreatorSelect = useCallback((creator: Creator | null) => {
        if (creator) {
            handleChange("creator_id", String(creator.id));
            handleChange("creatorSearch", creator.name);
        } else {
            handleChange("creator_id", "");
            handleChange("creatorSearch", "");
        }
    }, [handleChange]);

    // Soumission des filtres
    const submit = async () => {
        // On ne garde que les clés utiles
        const {
            keyword,
            creatorSearch,
            ...rest
        } = filters;

        const data: any = {
            ...rest,
            isDeleted: mapStatus(filters.isDeleted),
            processing: filters.processing,
        };

        // Place la valeur du champ keyword
        if (keyword && keyword.trim() !== "") {
            data.keyword = keyword;
        }

        // Optionnel : ne pas envoyer creatorSearch si inutile
        // (décommente si tu veux l'exclure du payload)
        // delete data.creatorSearch;

        // Pour debug : log le payload envoyé
        console.log("Payload envoyé:", data);

        localStorage.setItem("videos_filtered", JSON.stringify({ ...data, keyword }));

        const safeParams = params || {};
        const finalQuery = { ...safeParams, ...data, page: '1' };

        try {
            let fetched: any;
            if (scope === "bot") {
                const { getFilteredBotVideos } = await import("../api/videoBot");
                fetched = await getFilteredBotVideos(finalQuery);
            } else {
                const { getFilteredVideos } = await import("../api/videos");
                fetched = await getFilteredVideos(finalQuery);
            }
            onSubmit(fetched.data);
        } catch (error) {
            console.error("Erreur lors du filtrage :", error);
        }
    };

    const closeModal = () => {
        const modal = document.getElementById(
            "search_modal_52"
        ) as HTMLDialogElement | null;

        modal?.close();
    };

    return (
        <dialog id="search_modal_52" className="modal">
            <div className="flex flex-col gap-4 modal-box w-max bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300">

                {/* Sélections principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Global</label>
                        <input
                            type="text"
                            placeholder={t("videos.filter.global.placeholder", {
                                default: {
                                    en: "Search in all fields",
                                    zh: "在所有字段中搜索"
                                }                            })}
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.keyword || ""}
                            onChange={(e) => handleChange("keyword", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.category")}</label>
                        <select
                            className="select select-bordered w-full outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.category_id}
                            onChange={(e) => handleChange("category_id", e.target.value)}
                        >
                            <option value=''>{t("common.all")}</option>
                            {cat?.map?.((c: any, i: number) => (
                                <option key={i} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.subcategory")}</label>
                        <select
                            className="select select-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.sub_category_id}
                            onChange={(e) => handleChange("sub_category_id", e.target.value)}
                        >
                            <option value=''>{t("common.all")}</option>
                            {subcat?.SubCategorys?.map((c: any, i: number) => (
                                <option key={i} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.user")}</label>
                        <select
                            className="select select-bordered w-full outline-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.user_id}
                            onChange={(e) => handleChange("user_id", e.target.value)}
                        >
                            <option value=''>{t("common.all")}</option>
                            {users?.map((u: any, i: number) => (
                                <option key={i} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>

                    {/* Creator searchable */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.creator")}</label>
                        <CreatorAutoComplete
                            value={filters.creatorSearch || ""}
                            onChange={handleCreatorChange}
                            onSelect={handleCreatorSelect}
                            placeholder={t("creator.autocomplete.placeholder")}
                        />
                    </div>

                    {/* Tag Category search */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.tagCategory", {
                            default: {
                                en: "tagCategory",
                                zh: "标签类别"
                            }
                        })}</label>
                        <input
                            type="text"
                            placeholder={t("videos.filter.tagCategory.placeholder", {
                                default: {
                                    en: "Enter keyword",
                                    zh: "输入关键字"
                                }
                            })}
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.tagCategory || ""}
                            onChange={(e) => handleChange("tagCategory", e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtres de date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.start_date")}</label>
                        <input
                            type="date"
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.startedAt}
                            onChange={(e) => handleChange("startedAt", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">{t("videos.filter.end_date")}</label>
                        <input
                            type="date"
                            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-300"
                            value={filters.endAt}
                            onChange={(e) => handleChange("endAt", e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtres booléens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtre Deleted */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
                        <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">{t("videos.filter.deleted")}</p>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isDeleted"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.isDeleted === "all" || filters.isDeleted === ""}
                                    onChange={() => handleChange("isDeleted", "all")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.all")}</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isDeleted"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.isDeleted === "yes"}
                                    onChange={() => handleChange("isDeleted", "yes")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.yes")}</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isDeleted"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.isDeleted === "no"}
                                    onChange={() => handleChange("isDeleted", "no")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.no")}</span>
                            </label>
                        </div>
                    </div>

                    {/* Filtre Video Uploaded */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
                        <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">{t("videos.filter.uploaded")}</p>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="processing"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.processing === "all" || filters.processing === ""}
                                    onChange={() => handleChange("processing", "all")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.all")}</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="processing"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.processing === "done"}
                                    onChange={() => handleChange("processing", "done")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.yes")}</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="processing"
                                    className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                    checked={filters.processing === "null"}
                                    onChange={() => handleChange("processing", "null")}
                                />
                                <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.no")}</span>
                            </label>
                        </div>
                    </div>

                    {/* Filtre Accessing (only for superadmins) */}
                    {user?.role === RoleEnum.SUPERADMIN && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-300">
                            <p className="font-medium mb-2 text-gray-700 dark:text-gray-300">Show accessing</p>
                            <div className="flex gap-3">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessing"
                                        className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                        checked={filters.accessing === "all" || filters.accessing === ""}
                                        onChange={() => handleChange("accessing", "all")}
                                    />
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.all")}</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessing"
                                        className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                        checked={filters.accessing === "yes"}
                                        onChange={() => handleChange("accessing", "yes")}
                                    />
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.yes")}</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="accessing"
                                        className="radio radio-sm accent-blue-500 dark:accent-blue-400"
                                        checked={filters.accessing === "no"}
                                        onChange={() => handleChange("accessing", "no")}
                                    />
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{t("common.no")}</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <form method="dialog" className="pt-3 flex justify-end gap-3">
                    <button className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">{t("common.close")}</button>

                    <div
                        className="btn btn-outline btn-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
                        onClick={async () => {
                            setFilters({
                                category_id: "",
                                user_id: "",
                                creator_id: "",
                                    creatorSearch: "",
                                    keyword: "",
                                tagCategory: "",
                                isDeleted: "all",
                                processing: "",
                                sub_category_id: "",
                                startedAt: "",
                                endAt: "",
                            });
                            localStorage.removeItem("videos_filtered");
                            await submit();
                        }}
                    >
                        {t("common.reset")}
                    </div>

                    <button
                        className="btn btn-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-none transition-colors duration-300"
                        onClick={(e) => {
                            e.preventDefault();
                            submit();
                            closeModal();
                        }}
                    >
                        {t("common.apply")}
                    </button>
                </form>
            </div>
        </dialog>
    );
}

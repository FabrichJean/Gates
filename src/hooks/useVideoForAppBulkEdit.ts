import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { getCreators } from "../api/creators";
import { updateVideoForApp } from "../api/videoForApp";

export type VideoForAppCheckingStatus =
    | "ready"
    | "not ready"
    | "checked"
    | "waiting for checking"
    | "refused"
    | "null"
    | null;

export interface VideoForAppBulkEditData {
    title: string;
    description: string;
    tags: (number | { name: string })[];
    category: string;
    subcategory: string;
    isActive: boolean | null;
    checking: VideoForAppCheckingStatus;
    isBanned: boolean | null;
    creator_id: string;
    modifyTags: boolean;
    randomTags: boolean;
    randomTagsText: string;
    synchronize: boolean;
}

interface BulkEditProgress {
    current: number;
    total: number;
}

interface UseVideoForAppBulkEditOptions {
    selectedVideos: Set<number>;
    onRequestSync: (originIds: number[]) => void;
    onSuccess: () => void;
    onDeselectAll: () => void;
}

const initialBulkEditData: VideoForAppBulkEditData = {
    title: "",
    description: "",
    tags: [],
    category: "",
    subcategory: "",
    isActive: null,
    checking: null,
    isBanned: null,
    creator_id: "",
    modifyTags: false,
    randomTags: false,
    randomTagsText: "",
    synchronize: false,
};

export const useVideoForAppBulkEdit = ({
    selectedVideos,
    onRequestSync,
    onSuccess,
    onDeselectAll,
}: UseVideoForAppBulkEditOptions) => {
    const [isOpen, setIsOpen] = useState(false);
    const [bulkEditData, setBulkEditData] = useState<VideoForAppBulkEditData>(initialBulkEditData);
    const [bulkEditLoading, setBulkEditLoading] = useState(false);
    const [bulkEditProgress, setBulkEditProgress] = useState<BulkEditProgress>({ current: 0, total: 0 });
    const [creators, setCreators] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        getCreators()
            .then((res) => {
                if (!mounted) return;
                const list = res?.data?.creators || res;
                setCreators(Array.isArray(list) ? list : []);
            })
            .catch(() => {
                if (!mounted) return;
                setCreators([]);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const openBulkEdit = () => {
        setIsOpen(true);
    };

    const closeBulkEdit = () => {
        setIsOpen(false);
        setBulkEditData(initialBulkEditData);
        setBulkEditProgress({ current: 0, total: 0 });
    };

    const handleTagSelect = (tag: number | { name: string }) => {
        setBulkEditData((prev) => ({
            ...prev,
            tags: [...prev.tags, tag],
        }));
    };

    const handleTagDeselect = (tag: number | { name: string }) => {
        setBulkEditData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => {
                if (typeof tag === "number" && typeof t === "number") {
                    return t !== tag;
                }
                if (typeof tag === "object" && typeof t === "object") {
                    return t.name !== tag.name;
                }
                return true;
            }),
        }));
    };

    const pickRandomTags = (tagList: string[], count: number = 3): string[] => {
        const cleanedTags = tagList
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0);

        if (cleanedTags.length <= count) {
            return cleanedTags;
        }

        const shuffled = [...cleanedTags].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    };

    const handleBulkEditSubmit = async () => {
        if (selectedVideos.size === 0) return;

        if (bulkEditData.randomTags && bulkEditData.randomTagsText.trim().length === 0) {
            toast.error("Veuillez fournir une liste de tags pour la sélection aléatoire");
            return;
        }

        setBulkEditLoading(true);
        setBulkEditProgress({ current: 0, total: selectedVideos.size });
        let successCount = 0;
        let errorCount = 0;

        try {
            const creatorId = bulkEditData.creator_id.trim();

            for (const videoId of selectedVideos) {
                try {
                    const updateData: any = {};

                    if (bulkEditData.title) updateData.title = bulkEditData.title;
                    if (bulkEditData.description) updateData.description = bulkEditData.description;

                    let tagsToApply: (number | string)[] = [];

                    if (bulkEditData.randomTags) {
                        const tagList = bulkEditData.randomTagsText.split("\n");
                        const randomTagNames = pickRandomTags(tagList, 3);
                        tagsToApply = randomTagNames;
                    } else if (bulkEditData.modifyTags && bulkEditData.tags.length > 0) {
                        tagsToApply = bulkEditData.tags.map((t) => (typeof t === "number" ? t : (t as any).id ?? (t as any).name));
                    }

                    if (tagsToApply.length > 0) {
                        updateData.tag_category_ids = tagsToApply;
                    }

                    if (bulkEditData.category) updateData.category = bulkEditData.category;
                    if (bulkEditData.subcategory) updateData.subcategory = bulkEditData.subcategory;
                    if (creatorId) updateData.creator_id = Number(creatorId);
                    if (bulkEditData.isActive !== null) updateData.isDeleted = !bulkEditData.isActive;
                    if (bulkEditData.checking !== null) updateData.checking = bulkEditData.checking;
                    if (bulkEditData.isBanned !== null) updateData.isBanned = bulkEditData.isBanned;

                    if (Object.keys(updateData).length > 0) {
                        await updateVideoForApp(videoId, updateData);
                        successCount++;
                    }
                } catch (error) {
                    console.error(`Failed to update video ${videoId}:`, error);
                    errorCount++;
                }

                setBulkEditProgress((prev) => ({ ...prev, current: prev.current + 1 }));
            }

            if (bulkEditData.synchronize && selectedVideos.size > 0) {
                const originIds = Array.from(selectedVideos);
                onRequestSync(originIds);
            }

            if (successCount > 0) {
                toast.success(`成功更新了 ${successCount} 个视频`);
                onSuccess();
                closeBulkEdit();
                onDeselectAll();
            }

            if (errorCount > 0) {
                toast.error(`更新 ${errorCount} 个视频失败`);
            }
        } catch (error) {
            console.error("批量编辑错误:", error);
            toast.error("批量编辑过程中出错");
        } finally {
            setBulkEditLoading(false);
            setBulkEditProgress({ current: 0, total: 0 });
        }
    };

    return {
        isOpen,
        openBulkEdit,
        closeBulkEdit,
        bulkEditData,
        setBulkEditData,
        bulkEditLoading,
        bulkEditProgress,
        creators,
        handleTagSelect,
        handleTagDeselect,
        handleBulkEditSubmit,
    };
};

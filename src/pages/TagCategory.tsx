import { Tag as TagIcon } from "lucide-react";
import TagListPanel from "../components/TagListPanel";
import useVideoTagCategories from "../hooks/useVideoTagCategories";
import usePostTagCategories from "../hooks/usePostTagCategories";
import useMangaTagCategories from "../hooks/useMangaTagCategories";
import useAudioTagCategories from "../hooks/useAudioTagCategories";
import useRomanTagCategories from "../hooks/useRomanTagCategories";

export default function TagCategory() {
    const video = useVideoTagCategories();
    const post = usePostTagCategories();
    const manga = useMangaTagCategories();
    const audio = useAudioTagCategories();
    const roman = useRomanTagCategories();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Header compact */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TagIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">标签分类</h1>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{video.items.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">视频</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-medium text-green-600 dark:text-green-400">{post.items.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">帖子</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-medium text-purple-600 dark:text-purple-400">{manga.items.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">漫画</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-medium text-yellow-600 dark:text-yellow-400">{audio.items.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">音频</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-medium text-rose-600 dark:text-rose-400">{roman.items.length}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">小说</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <TagListPanel
                        title="视频标签"
                        icon={<TagIcon className="w-4 h-4 text-blue-500" />}
                        items={video.items}
                        loading={video.loading}
                        onCreate={video.createItem}
                        onUpdate={video.updateItem}
                        onDelete={video.removeItem}
                    />

                    <TagListPanel
                        title="帖子标签"
                        icon={<TagIcon className="w-4 h-4 text-green-500" />}
                        items={post.items}
                        loading={post.loading}
                        onCreate={post.createItem}
                        onUpdate={post.updateItem}
                        onDelete={post.removeItem}
                    />

                    <TagListPanel
                        title="漫画标签"
                        icon={<TagIcon className="w-4 h-4 text-purple-500" />}
                        items={manga.items}
                        loading={manga.loading}
                        onCreate={manga.createItem}
                        onUpdate={manga.updateItem}
                        onDelete={manga.removeItem}
                    />

                    <TagListPanel
                        title="音频标签"
                        icon={<TagIcon className="w-4 h-4 text-yellow-500" />}
                        items={audio.items}
                        loading={audio.loading}
                        onCreate={audio.createItem}
                        onUpdate={audio.updateItem}
                        onDelete={audio.removeItem}
                    />

                    <TagListPanel
                        title="小说标签"
                        icon={<TagIcon className="w-4 h-4 text-rose-500" />}
                        items={roman.items}
                        loading={roman.loading}
                        onCreate={roman.createItem}
                        onUpdate={roman.updateItem}
                        onDelete={roman.removeItem}
                    />
                </div>
            </div>
        </div>
    );
}

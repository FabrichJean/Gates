import { useNavigate } from "react-router-dom";
import usePostCreators from "../../hooks/usePostCreators";

interface Title {
  id: number;
  title: string;
  description: string;
  i18_language: string;
}

interface PostCardProps {
  post: any; // tu peux typer plus fort si tu veux
}


export function PostCard({ post }: PostCardProps) {
  const nav = useNavigate();
  // choisir un titre
  const mainTitle =
    post.titles?.find((t: Title) => t.i18_language === "en")?.title ||
    post.titles?.[0]?.title ||
    "Untitled";

  // choisir une image (priorité local > s3)
  const cover =
    post.images?.[0]?.public_urls?.local_image_url ||
    post.images?.[0]?.s3_urls?.imageUrl;

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition p-3 flex flex-col overflow-hidden cursor-pointer"
      onClick={() =>
        nav(
          post.user.username === "userbot"
            ? `/bot-posts/${post.id}`
            : `/post/${post.id}`
        )
      }
    >
      {cover && (
        <img
          src={cover}
          alt={mainTitle}
          className="w-full h-48 object-cover rounded-xl"
        />
      )}

      <div className="mt-3 flex flex-col gap-2">
        <h2 className="text-lg font-semibold line-clamp-2">{mainTitle}</h2>

        {/* Catégorie */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{post.postCategory?.name}</span>
          <span className="text-gray-500">•</span>
          <span>{post.postSubCategory?.name}</span>
        </div>

        {/* Créateur */}
        <div className="flex items-center gap-2 mt-1">
          <img
            src={post.creatorObj?.avatar}
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{post.creatorObj?.name}</span>
        </div>

        {/* Statuts */}
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span
            className={`px-2 py-1 rounded-md ${
              post.processing === "done"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {post.processing}
          </span>

          <span
            className={`px-2 py-1 rounded-md ${
              post.checking === "checked"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {post.checking}
          </span>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-500 mt-2">
          Ajouté le {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

export default function CreatorPost({ id }: { id: any }) {
  const { data } = usePostCreators(id);

  console.log(data);

  return (
    <div>
      {/* {data && <StatsPosts data={data.posts} />} */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {data?.posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

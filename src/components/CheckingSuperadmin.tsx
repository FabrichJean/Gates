import { FiHexagon } from "react-icons/fi";
import type { TVideo, User } from "../hooks/useVideos"
import CheckerDrop from "./CheckerDrop";

interface Props {
    video: TVideo;
    user: User;
    index: number;
    reFetch: () => void
}

function CheckingSuperadmin({ video, index, reFetch, user }: Props) {

    return (
        <div className={"dropdown " + (index === 0 ? " dropdown-end" : "dropdown-top dropdown-end")}>
            <div tabIndex={video.id} role="button" className="flex items-center gap-2 text-xs hover:bg-gray-200 w-max p-1 px-2 rounded-md cursor-default m-auto">
                <FiHexagon /> {video.checking === "null" ? "not ready" : video.checking}
            </div>
            {(video.checking === "null" && user.role === "superadmin") ? null : <CheckerDrop video={video} reFetch={reFetch} user={user}/>}
        </div>
    )
}

export default CheckingSuperadmin

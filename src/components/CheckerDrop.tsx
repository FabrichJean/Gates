import { FiHexagon } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import type { TVideo, User } from "../hooks/useVideos";
import { updateVideo } from "../api/videos";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface Props {
    user: User;
    video: TVideo;
    reFetch: () => void;
    openRefuseModal: () => void;
}

function CheckerDrop({ video, reFetch, user, openRefuseModal }: Props) {
    const update = async (check: string) => {
        if (check === "refused") {
            openRefuseModal();
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await updateVideo(video.id, { checking: check });
            reFetch();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.error("❌ Error: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <>
            {/* <dialog id="my_modal_16354" className="modal">
                <div className="modal-box flex flex-col gap-3 ">
                    <textarea className="textarea w-full" placeholder="Comment" onChange={(e) => {
                        setComment(e.currentTarget.value);
                    }} required></textarea>
                    <button className="btn" onClick={async () => {
                        if (!comment)
                            return;
                        await update('refused', comment);
                    }}>submit</button>
                </div>
            </dialog> */}
            <div tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-md z-100 w-52 p-2 border border-gray-300 shadow-sm">
                {
                    user.role === 'superadmin' ?
                        ["refused", "checked"]?.map(check => <div key={check} onClick={() => update((check === 'go ready' ? 'null' : check))} tabIndex={video.id} role="button" className="flex items-center justify-between gap-2 text-xs hover:bg-gray-200 w-full p-2 rounded-md cursor-default m-auto">
                            <span className="flex items-center gap-2"><FiHexagon /> {check}</span> {(check === 'go ready' ? 'null' : check) === video.checking ? <FaCheck /> : null}
                        </div>)
                        :
                        <>
                            {(video.checking === 'null' && <div onClick={() => update('waiting for checking')} tabIndex={video.id} role="button" className="flex items-center justify-between gap-2 text-xs hover:bg-gray-200 w-full p-2 rounded-md cursor-default m-auto">
                                <span className="flex items-center gap-2"><FiHexagon /> ready</span>
                            </div>)}
                            {(video.checking === 'refused' && <div className="flex flex-col items-center justify-between gap-2 text-xs hover:bg-gray-200 w-full p-2 rounded-md cursor-default m-auto">
                                <Link to={'/touch/'+video.id} className="btn w-full">Touch again</Link>
                                <p>{video.comment}</p>
                            </div>)}
                        </>
                }
            </div>
        </>
    )
}

export default CheckerDrop;

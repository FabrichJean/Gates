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
            toast.error("Error: " + (err.response?.data?.message || err.message));
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
            <div tabIndex={-1} className="dropdown-content menu bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md z-100 w-52 p-2 shadow-sm dark:shadow-gray-700 transition-colors duration-300">
                {
                    user.role === 'superadmin' ?
                        ["refused", "checked"]?.map(check => <div key={check} onClick={() => update((check === 'go ready' ? 'null' : check))} tabIndex={video.id} role="button" className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300">
                            <span className="flex items-center gap-2">
                                <FiHexagon className="text-gray-500 dark:text-gray-400" /> 
                                <span className="text-gray-700 dark:text-gray-300">{check}</span>
                            </span> 
                            {(check === 'go ready' ? 'null' : check) === video.checking ? <FaCheck className="text-green-600 dark:text-green-400" /> : null}
                        </div>)
                        :
                        <>
                            {(video.checking === 'null' && <div onClick={() => update('waiting for checking')} tabIndex={video.id} role="button" className="flex items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300">
                                <span className="flex items-center gap-2">
                                    <FiHexagon className="text-gray-500 dark:text-gray-400" /> 
                                    <span className="text-gray-700 dark:text-gray-300">ready</span>
                                </span>
                            </div>)}
                            {(video.checking === 'refused' && <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-full p-2 rounded-md cursor-default m-auto transition-colors duration-300">
                                <Link to={'/touch/'+video.id} className="btn bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 border-none w-full transition-colors duration-300">Touch again</Link>
                                <p className="text-gray-600 dark:text-gray-400 text-center">{video.comment}</p>
                            </div>)}
                        </>
                }
            </div>
        </>
    )
}

export default CheckerDrop;

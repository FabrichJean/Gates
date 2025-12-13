import { useParams } from "react-router-dom";
import CreatorPost from "./Creator/CreatorPost";
import CreatorVideosCard from "../components/CardVideoCreator";
import CardVideoBotCreator from "../components/videos/cardVideoBotCreator";



const Creator = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <div className="w-full border border-gray-500 rounded-md p-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-lg">Creator ID: {id}</div>
        </div>
      </div>

      <div className="tabs tabs-border">
        <input type="radio" name="my_tabs_2" className="tab text-teal-800 dark:text-teal-600" aria-label="Videos" defaultChecked />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CreatorVideosCard creatorId={id!} />
        </div>

        <input type="radio" name="my_tabs_2" className="tab text-teal-800 dark:text-teal-600" aria-label="Posts" />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CreatorPost id={id} />
        </div>

        <input type="radio" name="my_tabs_2" className="tab text-teal-800 dark:text-teal-600 " aria-label="Videos bot" />
        <div className="tab-content border border-gray-200 dark:border-gray-700 p-6 mt-2">
          <CardVideoBotCreator creatorId={id!} />
        </div>
      </div>
    </>
  );
}

export default Creator;
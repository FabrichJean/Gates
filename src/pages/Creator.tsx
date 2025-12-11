import { useParams } from "react-router-dom";
import CreatorVideosCard from "../components/CardVideoCreator";


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
        <input type="radio" name="my_tabs_2" className="tab" aria-label="Videos" defaultChecked />
        <div className="tab-content border-base-300 p-10">
          <CreatorVideosCard creatorId={id!} />
        </div>

        <input type="radio" name="my_tabs_2" className="tab" aria-label="Posts" />
        <div className="tab-content border-base-300 p-10">
          Posts
        </div>
      </div>
    </>
  );
}

export default Creator;
import { useParams } from "react-router-dom";
import CreatorPost from "./Creator/CreatorPost";



const Creator = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      {/* name of each tab group should be unique */}
      <div className="w-full border border-gray-500 rounded-md p-2">
        <div className="flex items-center gap-2">

        </div>
      </div>
      <div className="tabs tabs-border">
        <input type="radio" name="my_tabs_2" className="tab" aria-label="Videos" />
        <div className="tab-content border-base-300  p-10 ">Videos</div>

        <input type="radio" name="my_tabs_2" className="tab" aria-label="Posts" defaultChecked />
        <div className="tab-content border-base-300 p-10">
          <CreatorPost id={id}/>
        </div>
      </div>
    </>
  );
}

export default Creator;
import CategoryManager from "./CategoryManager";

export default function Plateform() {
  return (
    <div className="w-full overflow-x-auto">
      {/* name of each tab group should be unique */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Plateforms"
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          className="tab"
          aria-label="Categories"
          defaultChecked
        />
        <div className="tab-content border-base-300 bg-base-100 p-10">
          <CategoryManager/>
        </div>
      </div>
    </div>
  );
}

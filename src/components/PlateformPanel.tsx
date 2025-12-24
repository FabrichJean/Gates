import { useState } from "react";
import AnimatedList from "./AnimatedList";
import PlateformCard from "./PlateformCard";
import { usePlateformByCategory } from "../hooks/plateform-category";
import UsePlateform from "../hooks/usePlateform";
import { addCategoryToPlateformApi } from "../api/plateformCategory";
import toast from "react-hot-toast";

interface Props {
  categoryId: number | null;
}

export default function PlateformPanel({ categoryId }: Props) {
  const [new_, setNew] = useState<number | null>();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: plateforms, reFetch } = usePlateformByCategory(
    categoryId || -1
  );

  const { data: allPlateforms } = UsePlateform();

  const add = async () => {
    if (!new_ || !categoryId) return;

    await addCategoryToPlateformApi(new_, categoryId)
      .then(reFetch)
      .catch(() => {
        toast.error("err");
      });
    setNew(undefined);
  };
  
  return (
    <div className="md:w-1/3 bg-white dark:bg-gray-800 shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 transition-all duration-300">
      <h1 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        Plateform
      </h1>

      {categoryId ? (
        <>
          <div className="flex gap-2 my-4">
            <select
              value={new_!}
              onChange={(e) => setNew(Number(e.target.value))}
              // placeholder="select plateform"
              className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg flex-1 px-2 py-1 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 transition-all duration-300"
            >
              <option value={undefined}>
                ---select-plateform---
              </option>
              {allPlateforms?.map((allp) => (
                <option value={allp.id} key={allp.id}>
                  {allp.name}
                </option>
              ))}
            </select>
            <button
              onClick={add}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all duration-300"
            >
              +
            </button>
          </div>

          <AnimatedList items={plateforms}>
            {(c) => (
              <PlateformCard
                key={c.id}
                plateform={c}
                categoryId={categoryId}
                isSelected={selectedId === c.id}
                onDelete={reFetch}
                onSelect={() => setSelectedId(c.id as number)}
              />
            )}
          </AnimatedList>
        </>
      ) : null}
    </div>
  );
}

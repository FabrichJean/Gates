import { useEffect, useState } from "react";
import type { Platform } from "../hooks/usePlatform";
import { usePlatformReactive } from "../hooks/usePlatform";

interface Props {
    onSelect?: (platform: Platform) => void;
    defaultValue?: Platform;
}

const PlatformSelectComponent = ({ onSelect, defaultValue }: Props) => {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const { data } = usePlatformReactive();
    const [selected, setSelected] = useState<number | "">(defaultValue ? defaultValue.id : "");

    useEffect(() => {
        if (data) {
            setPlatforms(data);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "" || value === "all") {
            setSelected("");
            return;
        }
        const platformId = Number(value);
        setSelected(platformId);
        const selectedPlatform = platforms?.find((p) => p.id === platformId);

        if (selectedPlatform && onSelect) {
            onSelect(selectedPlatform);
        }
    };

   return (
    <select 
        value={selected}
        onChange={handleChange}
        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none transition-all duration-300 text-gray-700 dark:text-gray-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500">
        <option value="" className="flex items-center justify-center">--Select a platform--</option>
        
        {platforms.map((platform) => (
            <option key={platform.id} value={platform.id} className=" flex items-center justify-center g-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">{platform.name}</option>
        ))}
    </select>
   );
};

export default PlatformSelectComponent;
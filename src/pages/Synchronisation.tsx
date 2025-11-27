import { useState } from "react";
import SelectModal from "../components/SelectModal";
import useSyncOption from "../hooks/useSyncOption";
import CardFlottant from "../components/CardFlottant";

const Synchronisation = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<number | null>(null);

    const options = [
        { id: "true", title: "with Force", subtitle: "all data except the ID should be updated directly" },
        { id: "false", title: "No Force", subtitle: "records with an existing ID should not be overwritten" },
    ];

    // static JSON data for table rows
    const rows = [
        { id: 1, name: 'Apple MacBook Pro 17"', color: 'Silver' },
        { id: 2, name: 'Microsoft Surface Pro', color: 'White' },
        { id: 3, name: 'Magic Mouse 2', color: 'Black' },
    ];

    const handleOpenFor = (id?: number) => {
        setSelectedRow(id || null);
        setModalOpen(true);
    };

    const { sync } = useSyncOption();

    const handleSubmit = async (optionId: string | null) => {
        const force = optionId === "true";
        try {
            const result = await sync({ isForce: force, label: selectedRow !== null ? selectedRow.toString() : null });
            console.log("Sync result:", result);
        } catch (err) {
            console.error("Sync failed", err);
        }
    };

    return (
        <div className="h-screen w-full flex p-2">
            <div className="w-full h-full flex flex-col">
                {/* view error process */}
                <div className="w-full flex justify-between">
                    <h2 className="text-2xl font-semibold mb-4">Synchronisation</h2>
                    <button
                        onClick={handleOpenFor.bind(null, undefined)}
                        className="p-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2 text-nowrap font-medium text-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="md:inline hidden text-gray-600 dark:text-gray-400 PX-3">Launch Synchronisation</span>
                    </button>
                </div>

                {/* list */}

                <div className="w-full flex flex-col mt-6">
                    <h2 className="font-bold pb-2 text-pink-400">Error liste</h2>

                    <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
                        <table className="w-full text-sm text-left rtl:text-right text-body">
                            <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                                <tr>
                                    <th scope="col" className="px-6 py-3 font-medium">Column 1</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Column 2</th>
                                    <th scope="col" className="px-6 py-3 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="bg-neutral-primary border-b border-default">
                                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">{row.name}</th>
                                        <td className="px-6 py-4">{row.color}</td>
                                        <td className="px-6 py-4">
                                            <span className="cursor-pointer text-brand-600" onClick={() => handleOpenFor(row.id)}>Sync</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <SelectModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    options={options}
                    rowLabel={selectedRow}
                    title={selectedRow ? `Sync: ${selectedRow}` : "Select an option"}
                    onSubmit={handleSubmit}
                />
            </div>
            {/* <CardFlottant /> */}

        </div>


    );
};

export default Synchronisation;
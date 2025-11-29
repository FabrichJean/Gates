import { useState } from "react";
import SelectModal from "../components/SelectModal";
import useSyncOption from "../hooks/useSyncOption";
import useSyncErrors from "../hooks/useSyncErrors";
import useCardFlottant from "../hooks/useCardFlottant";
import { Link } from "react-router-dom";
import { FaSyncAlt } from "react-icons/fa";

const Synchronisation = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"firstTab" | "errorList">(
    "errorList"
  );

  const { data: syncErrors, loading, error, reFetch } = useSyncErrors();

  const { show } = useCardFlottant();

  const options = [
    {
      id: "true",
      title: "with Force",
      subtitle: "all data except the ID should be updated directly",
    },
    {
      id: "false",
      title: "No Force",
      subtitle: "records with an existing ID should not be overwritten",
    },
  ];

  const handleOpenFor = (id?: number) => {
    setSelectedRow(id || null);
    setModalOpen(true);
  };

  const { sync } = useSyncOption();

  const handleSubmit = async (
    optionId: string | null,
    label: number | null,
    platformId?: number | null
  ) => {
    const force = optionId === "true";
    try {
      show();
      const result = await sync({
        isForce: force,
        label: label !== null ? label.toString() : null,
        platformId: platformId,
      });
      console.log("Sync result:", result);
      // Refresh the errors list after successful sync
      reFetch();
      // Close the modal
      setModalOpen(false);
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
            <FaSyncAlt/>
            <span className="md:inline hidden text-gray-600 dark:text-gray-400 PX-3">
              Launch Synchronisation
            </span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs tabs-bordered w-full mt-6">
          <button
            className={`tab tab-bordered ${
              activeTab === "errorList" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("errorList")}
          >
            Error List
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "firstTab" ? (
          <div className="w-full flex flex-col mt-6">
            <h2 className="font-bold pb-2 text-blue-400">First Tab Content</h2>
            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default p-6">
              <div className="text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">
                  Welcome to First Tab
                </h3>
                <p>
                  This is the content for the first tab. You can add any content
                  here.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col mt-6">
            <h2 className="font-bold pb-2 text-pink-400">Error List</h2>

            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
              <table className="w-full text-sm text-left rtl:text-right text-body">
                <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Entity
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Platform
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Origin ID
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Source ID
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Resolved
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Created
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2">Loading errors...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-red-500"
                      >
                        Error loading sync errors: {error.message}
                        <button
                          onClick={reFetch}
                          className="ml-2 px-2 py-1 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : syncErrors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No sync errors found
                      </td>
                    </tr>
                  ) : (
                    syncErrors.map((row) => (
                      <tr
                        key={row.id}
                        className="bg-neutral-primary border-b border-default"
                      >
                        <td className="px-4 py-3">{row.id}</td>
                        <td className="px-4 py-3">{row.entity}</td>
                        <td className="px-4 py-3">
                          {row.plateform?.name ?? row.plateform_id}
                        </td>
                        <td className="px-4 py-3">
                          {row.origin_id
                            ? row.entity === "video" || row.entity === "post"
                              ? (() => {
                                  // choose base path depending on entity
                                  const basePath =
                                    row.entity === "video" ? "videos" : "posts";
                                  const href = `/${basePath}/${row.origin_id}`;
                                  return (
                                    <Link
                                      to={href}
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {row.origin_id}
                                    </Link>
                                  );
                                })()
                              : String(row.origin_id)
                            : "-"}
                        </td>
                        <td className="px-4 py-3">{row.source_id ?? "-"}</td>
                        <td className="px-4 py-3">
                          {row.resolved ? (
                            <span className="text-green-600 font-medium">
                              Resolved
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.createdAt
                            ? new Date(row.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleOpenFor(row.id)}
                          >
                            Sync
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <SelectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          options={options}
          rowLabel={selectedRow}
          title={selectedRow ? `Sync: ${selectedRow}` : "Select an option"}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default Synchronisation;

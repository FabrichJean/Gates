import { useState, useEffect } from "react";
import UsePlateform from "../hooks/usePlateform";
import { MdCheck } from "react-icons/md";

interface Option {
  id: string;
  title: string;
  subtitle?: string;
}

interface Platform {
  id: number;
  name: string;
}

interface SelectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    optionId: string | null,
    label: number | null,
    platformId?: number | null,
    isMode?: boolean | null,
  ) => void;
  title?: string;
  options?: Option[];
  rowLabel?: number | null;
}

const SelectModal = ({
  open,
  onClose,
  onSubmit,
  title = "Sync option",
  rowLabel,
}: SelectModalProps) => {
  const { data: platforms } = UsePlateform();
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
  const [sendAll, setSendAll] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setSelectedPlatform(
        platforms && platforms.length ? platforms[0].id : null,
      );
    }
  }, [open, platforms]);

  const selectedPlatformName =
    platforms?.find((p: Platform) => p.id === selectedPlatform)?.name ?? null;

  const handleSync = (label: number | null, isForce: boolean) => () => {
    const platformToSend =
      rowLabel == null ? (selectedPlatform ?? null) : undefined;
    if (typeof onSubmit === "function") {
      onSubmit(
        isForce.toString(),
        label!,
        platformToSend as number | null | undefined,
        sendAll,
      );
      onClose();
    }
  };

  return (
    <div
      id="select-modal"
      tabIndex={-1}
      aria-hidden={!open}
      className={`${
        open ? "flex" : "hidden"
      } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black/50`}
    >
      <div className="relative p-4 w-full max-w-md  max-h-full inset-0 backdrop-blur-2xl  shadow-lg">
        <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6 bg-white dark:bg-gray-800 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 className="text-lg font-medium text-heading">{title}</h3>
            <button
              type="button"
              className="text-body hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-7 h-7 ms-auto inline-flex justify-center items-center bg-slate-100 hover:bg-slate-200 rounded-full focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18 17.94 6M18 18 6.06 6"
                />
              </svg>
            </button>
          </div>

          <div className="pt-4 md:pt-6">
            {!rowLabel && platforms && platforms?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-heading mb-2">
                  Select Platform:
                </label>
                <select
                  value={selectedPlatform || ""}
                  onChange={(e) =>
                    setSelectedPlatform(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full p-2 border border-default rounded-base bg-neutral-primary-soft dark:bg-gray-700 text-heading dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-subtle rounded-lg"
                >
                  {platforms?.map((platform: Platform) => (
                    <option
                      key={platform.id}
                      value={platform.id}
                      className="bg-white dark:bg-gray-800 text-heading dark:text-gray-200"
                    >
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* deux boutons radio Send all et only (affiché seulement après sélection de la plateforme) */}
            {(rowLabel || selectedPlatform != null) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-heading mb-2">
                  Mode:
                </label>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={!sendAll}
                      onChange={() => setSendAll(false)}
                      className={`form-radio h-4 w-4 cursor-pointer rounded-full ${!sendAll ? "text-blue-600 p-2 bg-blue-500" : "text-brand-subtle bg-slate-200"}`}
                    />
                    <span
                      className={`ms-2 text-sm ${!sendAll ? "text-blue-100" : ""}`}
                    >
                      Only {`${selectedPlatformName}`}
                    </span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={sendAll}
                      onChange={() => setSendAll(true)}
                      className={`form-radio h-4 w-4 cursor-pointer rounded-full ${sendAll ? "text-blue-600 p-2 bg-blue-500" : "text-brand-subtle bg-slate-200"}`}
                    />
                    <span
                      className={`ms-2 text-sm ${sendAll ? "text-blue-100" : ""}`}
                    >
                      Send All
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-4">
              <button
                onClick={handleSync(rowLabel ?? null, true)}
                className="inline-flex items-center w-full p-5 dark:hover:bg-slate-600 hover:bg-slate-100 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong rounded-lg"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded bg-brand-soft text-fg-brand-strong">
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M7.111 20A3.111 3.111 0 0 1 4 16.889v-12C4 4.398 4.398 4 4.889 4h4.444a.89.89 0 0 1 .89.889v12A3.111 3.111 0 0 1 7.11 20Zm0 0h12a.889.889 0 0 0 .889-.889v-4.444a.889.889 0 0 0-.889-.89h-4.389a.889.889 0 0 0-.62.253l-3.767 3.665a.933.933 0 0 0-.146.185c-.868 1.433-1.581 1.858-3.078 2.12Zm0-3.556h.009m7.933-10.927 3.143 3.143a.889.889 0 0 1 0 1.257l-7.974 7.974v-8.8l3.574-3.574a.889.889 0 0 1 1.257 0Z"
                    />
                  </svg>
                </div>
                <div className="block ms-2.5">
                  <div className="w-full text-base font-medium">with Force</div>
                  <div className="w-full text-xs">
                    all data except the ID should be updated directly
                  </div>
                </div>
                <svg
                  className="w-5 h-5  rtl:rotate-180 ms-auto"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 12H5m14 0-4 4m4-4-4-4"
                  />
                </svg>
              </button>

              <button
                onClick={handleSync(rowLabel ?? null, false)}
                className="inline-flex items-center w-full dark:hover:bg-slate-600 hover:bg-slate-100 p-5 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong rounded-lg"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded bg-brand-soft text-fg-brand-strong">
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M7.111 20A3.111 3.111 0 0 1 4 16.889v-12C4 4.398 4.398 4 4.889 4h4.444a.89.89 0 0 1 .89.889v12A3.111 3.111 0 0 1 7.11 20Zm0 0h12a.889.889 0 0 0 .889-.889v-4.444a.889.889 0 0 0-.889-.89h-4.389a.889.889 0 0 0-.62.253l-3.767 3.665a.933.933 0 0 0-.146.185c-.868 1.433-1.581 1.858-3.078 2.12Zm0-3.556h.009m7.933-10.927 3.143 3.143a.889.889 0 0 1 0 1.257l-7.974 7.974v-8.8l3.574-3.574a.889.889 0 0 1 1.257 0Z"
                    />
                  </svg>
                </div>
                <div className="block ms-2.5">
                  <div className="w-full text-base font-medium">No Force</div>
                  <div className="w-full text-xs">
                    records with an existing ID should not be overwritten
                  </div>
                </div>
                <svg
                  className="w-5 h-5  rtl:rotate-180 ms-auto"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 12H5m14 0-4 4m4-4-4-4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;

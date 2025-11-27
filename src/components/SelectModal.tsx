import { useState, useEffect } from "react";
import UsePlateform from "../hooks/usePlateform";

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
  onSubmit?: (
    optionId: string | null,
    label: number | null,
    platformId?: number | null
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
  options = [],
  rowLabel = null,
}: SelectModalProps) => {
  const { data: platforms } = UsePlateform();
  const [selected, setSelected] = useState<string | null>(
    options.length ? options[0].id : null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(
    platforms?.length ? platforms[0].id : null
  );

  useEffect(() => {
    if (open) {
      setSelected(options.length ? options[0].id : null);
      setSelectedPlatform(platforms?.length ? platforms[0].id : null);
    }
  }, [open, options, platforms]);
  return (
    <div
      id="select-modal"
      tabIndex={-1}
      aria-hidden={!open}
      className={`${
        open ? "flex" : "hidden"
      } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
    >
      <div className="relative p-4 w-full max-w-md dark:bg-gray-800 max-h-full inset-0 backdrop-blur-2xl border boder-white shadow-lg">
        <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 className="text-lg font-medium text-heading">{title}</h3>
            <button
              type="button"
              className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
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
            {rowLabel && (
              <p className="text-sm text-body mb-3">
                Selected row id:{" "}
                <strong className="text-heading">{rowLabel}</strong>
              </p>
            )}

            {!rowLabel && platforms && platforms?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-heading mb-2">
                  Select Platform:
                </label>
                <select
                  value={selectedPlatform || ""}
                  onChange={(e) =>
                    setSelectedPlatform(Number(e.target.value) || null)
                  }
                  className="w-full p-2 border border-default rounded-base bg-neutral-primary-soft text-heading focus:outline-none focus:ring-2 focus:ring-brand-subtle"
                >
                  {platforms?.map((platform: Platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ul className="space-y-4 mb-4">
              {options.map((opt) => (
                <li key={opt.id}>
                  <input
                    type="radio"
                    id={opt.id}
                    name="job"
                    value={opt.id}
                    className="hidden peer"
                    checked={selected === opt.id}
                    onClick={() => {
                      setSelected(opt.id);
                      if (typeof onSubmit === "function") {
                        // call submit immediately when an option is clicked
                        onSubmit(
                          opt.id,
                          rowLabel,
                          !rowLabel ? selectedPlatform : undefined
                        );
                      }
                      // close modal after selecting
                      onClose();
                    }}
                  />
                  <label
                    htmlFor={opt.id}
                    className="inline-flex items-center w-full p-5 text-body bg-neutral-primary-soft border-1 border-default rounded-base cursor-pointer peer-checked:hover:bg-brand-softer peer-checked:border-brand-subtle peer-checked:bg-brand-softer hover:bg-neutral-secondary-medium peer-checked:text-fg-brand-strong"
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
                      <div className="w-full text-base font-medium">
                        {opt.title}
                      </div>
                      {opt.subtitle && (
                        <div className="w-full text-xs">{opt.subtitle}</div>
                      )}
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
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectModal;

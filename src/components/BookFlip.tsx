import { useState } from "react";

interface BookFlipProps {
  images?: string[];
  cover?: string;
}

function isDarkMode() {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export default function BookFlip({ images = [], cover }: BookFlipProps) {
  const pages = cover ? [cover, ...images] : images;

  const [page, setPage] = useState(0);

  const nextPage = () => setPage((p) => Math.min(p + 1, pages.length - 1));
  const prevPage = () => setPage((p) => Math.max(p - 1, 0));

  const dark = isDarkMode();

  return (
    <div className={`book-container ${dark ? "dark" : ""}  border-white`}>
      <div className={`book ${dark ? "dark" : ""} border border-white`}>
        {pages.map((src, idx) => {
          const isFlipped = idx <= page;
          return (
            <div
              key={idx}
              className={`page ${isFlipped ? "flipped" : ""} ${dark ? "dark" : ""} bg-[url("${cover}")]`}
              style={{ zIndex: pages.length - idx }}
            >
              <img
                src={src}
                alt={idx === 0 && cover ? "cover" : `page-${idx}`}
              />
            </div>
          );
        })}
      </div>

      <div className={`controls ${dark ? "dark" : ""}`}>
        <button onClick={prevPage} disabled={page === 0}>
          ⬅ Précédent
        </button>
        <button onClick={nextPage} disabled={page === pages.length - 1}>
          Suivant ➡
        </button>
      </div>
    </div>
  );
}
  "use client";

  import { useRef, useState } from "react";
  import "../comp_css/FilterSidebar.css";

  const ALL_GENRES = [
    'Action','Adventure','Animation','Anime','B-Action','B-Horror','Baseball','Basketball',
    'Biography','Boxing','Caper','Comedy','Coming-of-Age','Concert','Crime','Cyberpunk',
    'Disaster','Docudrama','Documentary','Drama','Epic','Family','Fantasy','Farce',
    'Football','Gangster','Giallo','Heist','History','Holiday','Horror','Isekai','Iyashikei',
    'Josei','Kaiju','Mecha','Mockumentary','Motorsport','Music','Musical','Mystery','News',
    'Parody','Quest','Romance','Samurai','Satire','Sci-Fi','Seinen','Shōjo','Shōnen',
    'Slapstick','Soccer','Sport','Spy','Stand-Up','Steampunk','Superhero','Survival',
    'Swashbuckler','Thriller','Tragedy','War','Western','Whodunnit','Wuxia'
  ];

  type SidebarProps = {
    filters: {
      yearRange: [number, number];
      genres: string[];
      search: string;
    };
    setFilters: (value: any) => void;
    mode: "random" | "top";
    setMode: (mode: "random" | "top") => void;
    refreshList: () => void;
  };

  export default function FilterSidebar({
    filters,
    setFilters,
    mode,
    setMode,
    refreshList
  }: SidebarProps) {

    const [genreSearch, setGenreSearch] = useState("");
    const isDragging = useRef<null | "min" | "max">(null);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    // filter genres based on search text
    const displayedGenres = ALL_GENRES.filter((g) =>
      g.toLowerCase().includes(genreSearch.toLowerCase())
    );

    // toggle a genre on/off
    const handleGenreToggle = (genre: string) => {
      const current = filters.genres || [];

      const updated = current.includes(genre)
        ? current.filter((g) => g !== genre)
        : [...current, genre];

      setFilters({ ...filters, genres: updated });
    };

    const startDrag = (e: React.MouseEvent, type: "min" | "max") => {
      isDragging.current = type;
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDrag);
    };

    const onDrag = (e: MouseEvent) => {
      if (!isDragging.current || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));

      const year = Math.round(1960 + pct * (2025 - 1960));

      setFilters((prev: any) => {
        let [min, max] = prev.yearRange;

        if (isDragging.current === "min") {
          min = Math.min(year, max);
        } else {
          max = Math.max(year, min);
        }
        return { ...prev, yearRange: [min, max] };
      });
    };

    const stopDrag = () => {
      isDragging.current = null;
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };

    const [minY, maxY] = filters.yearRange;
    const rangePct = (minY - 1960) / (2025 - 1960) * 100;
    const widthPct = ((maxY - minY) / (2025 - 1960)) * 100;

    return (
      <div className="sidebar">
        <h3 className="sidebar-title">Filters</h3>

        <button className="sidebar-refresh-btn" onClick={refreshList}>
          Refresh
        </button>

        <div className="sidebar-mode-control">
          <button
            className={`sidebar-mode-btn ${mode === "random" ? "active" : ""}`}
            onClick={() => setMode("random")}
          >
            Random 25
          </button>

          <button
            className={`sidebar-mode-btn ${mode === "top" ? "active" : ""}`}
            onClick={() => setMode("top")}
          >
            Top 25
          </button>
        </div>

        <div className="sidebar-section">
          <label className="sidebar-label">Year range ({minY} – {maxY})</label>

          <div className="dual-slider" ref={sliderRef}>
            <div className="dual-slider-track" />
            <div
              className="dual-slider-range"
              style={{
                left: `${rangePct}%`,
                width: `${widthPct}%`,
              }}
            />

            <div
              className="dual-slider-thumb"
              style={{
                left: `${(filters.yearRange[0] - 1960) / (2025 - 1960) * 100}%`,
                zIndex:
                  filters.yearRange[0] === 2025 && filters.yearRange[1] === 2025
                    ? 3   // when both at max year, min thumb must be on top
                    : 2   // otherwise min should be under max
              }}
              onMouseDown={(e) => startDrag(e, "min")}
            />

            <div
              className="dual-slider-thumb"
              style={{
                left: `${(filters.yearRange[1] - 1960) / (2025 - 1960) * 100}%`,
                zIndex:
                  filters.yearRange[0] === 2025 && filters.yearRange[1] === 2025
                    ? 2   // when both at max year, max thumb must be on bottom
                    : 3   // otherwise max should be on top normally
              }}
              onMouseDown={(e) => startDrag(e, "max")}
            />
          </div>
        </div>

        <div className="sidebar-section">
          <label className="sidebar-label">Genres</label>

          <input
            className="sidebar-input"
            type="text"
            placeholder="Search genres..."
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
          />

          <div className="genre-scroll-area">
            {displayedGenres.map((genre) => (
              <label key={genre} className="genre-item">
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                />
                {genre}
              </label>
            ))}

            {displayedGenres.length === 0 && (
              <p className="no-results">No genres match your search.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
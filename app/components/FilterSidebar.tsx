  "use client";

  import { useState } from "react";
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

        {/* <div className="sidebar-section">
          <label className="sidebar-label">Search movies</label>
          <input
            className="sidebar-input"
            type="text"
            placeholder="Search title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div> */}

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
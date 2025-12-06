// app/trends/page.tsx
"use client";

import { useEffect, useState } from "react";
import { loadMovies } from "../data/loadMovies";
import type { Movie } from "../types/Movie";

import NavBar from "../components/NavBar";
import FilterSidebar from "../components/FilterSidebar";
import BubbleChart from "../components/TrendsBubble";
import GenreTreemap, { YearRange as TreemapYearRange } from "../components/GenreTreemap";
import TrendChart, { GroupMode, YearRange } from "../components/TrendChart";
import MovieModal from "../components/MovieModal";

import "../comp_css/Trends.css";

type YearRange = { startYear: number; endYear: number };

export default function TrendsPage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [filters, setFilters] = useState({
    genres: [] as string[],
    countries: [] as string[],
    yearRange: [1960, 2025] as [number, number],
    search: "",
    count: 25,
  });

  const [mode, setMode] = useState<"random" | "top">("random");
  const [groupMode, setGroupMode] = useState<GroupMode>("decade");
  const [selectedRange, setSelectedRange] = useState<YearRange | null>(null);

  // 加载所有电影
  useEffect(() => {
    loadMovies().then((movies) => {
      setAllMovies(movies);
      setFilteredMovies(movies);
    });
  }, []);

  // 根据 filters + mode 计算参与趋势和气泡图的电影集合
  useEffect(() => {
    if (allMovies.length === 0) return;

    let result = [...allMovies];

    // 1) genres（与 recommendations 保持一致）
    const selectedGenres = filters.genres;
    if (selectedGenres.length > 0) {
      result = result.filter((movie) =>
        movie.genre_token.some((token) => selectedGenres.includes(token))
      );
    }

    // 2) 年份范围
    const [minYear, maxYear] = filters.yearRange;
    result = result.filter((movie) => {
      const y = Number(movie.year);
      return y >= minYear && y <= maxYear;
    });

    // 3) 搜索标题
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter((movie) =>
        movie.title.toLowerCase().includes(q)
      );
    }

    // 4) mode：random 使用全部过滤结果；top 则取评分最高的前 300 看趋势
    if (mode === "top") {
      result = result
        .slice()
        .sort(
          (a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)
        )
        .slice(0, 300);
    }

    setFilteredMovies(result);
  }, [allMovies, filters, mode]);

  const refreshList = () => {
    // 在 trends 页不需要重新抽样，保持当前 filteredMovies 即可
    setFilteredMovies((prev) => [...prev]);
  };

  // 切换 decade/year
  const handleModeSwitch = (next: GroupMode) => {
    setGroupMode(next);
    setSelectedRange(null);
  };

  return (
    <div className="trends-container">
      <NavBar active="trends" />

      <div className="trends-content">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          mode={mode}
          setMode={setMode}
          refreshList={refreshList}
        />

        <div className="trends-main-panel">
          {allMovies.length === 0 ? (
            <p className="trends-loading">Loading…</p>
          ) : (
            <>
              <div className="trends-chart-area">
                <div className="trends-mode-toggle">
                  <button
                    className={`trends-mode-btn ${groupMode === "decade" ? "active" : ""}`}
                    type="button"
                    onClick={() => handleModeSwitch("decade")}
                  >
                    Group by decade
                  </button>
                  <button
                    className={`trends-mode-btn ${groupMode === "year" ? "active" : ""}`}
                    type="button"
                    onClick={() => handleModeSwitch("year")}
                  >
                    Group by year
                  </button>
                </div>

                <TrendChart
                  data={filteredMovies}
                  mode={groupMode}
                  selectedRange={selectedRange}
                  onRangeChange={setSelectedRange}
                />
              </div>

              <div className="trends-bubble-section">
                <h3 className="trends-bubble-title">
                  Movies within the current filters
                  {selectedRange
                    ? ` (highlighting ${selectedRange.startYear}–${selectedRange.endYear})`
                    : ""}
                </h3>

                <BubbleChart
                  data={filteredMovies}
                  onMovieClick={(movie) => setSelectedMovie(movie)}
                  highlightRange={selectedRange}
                />
              </div>

              <div className="trends-treemap-section">
                <GenreTreemap data={filteredMovies} selectedRange={selectedRange} />
              </div>
            </>
          )}
        </div>
      </div>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}

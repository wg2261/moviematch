"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import { loadMovies } from "../data/loadMovies";
import type { Movie } from "../types/Movie";

import BubbleChart from "../components/BubbleChart";
import FilterSidebar from "../components/FilterSidebar";
import MovieModal from "../components/MovieModal";
import NavBar from "../components/NavBar";

import "../comp_css/Recommendations.css";

export default function RecommendationsPage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const [filters, setFilters] = useState({
    genres: [] as string[],
    countries: [] as string[],
    yearRange: [1960, 2025] as [number, number],
    count: 25,
  });

  const [mode, setMode] = useState<"random" | "top">("random");

  // load movie data once
  useEffect(() => {
    loadMovies().then((movies) => {
      setAllMovies(movies);
      // default: random 25 from all
      setVisibleMovies(d3.shuffle([...movies]).slice(0, filters.count));
    });
  }, []);

  // helper: apply filters + mode to compute visible movies
  const computeVisible = () => {
    if (allMovies.length === 0) return;

    let filtered = [...allMovies];

    const selectedGenres = filters.genres; // e.g. ["Horror","Comedy"]

    // 1) genre filtering using genre_token (ANY-match)
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((movie) =>
        movie.genre_token.some((token) => selectedGenres.includes(token))
      );
    }

    // 2) year range filter
    const [minYear, maxYear] = filters.yearRange;
    filtered = filtered.filter((movie) => {
      const y = Number(movie.year);
      return y >= minYear && y <= maxYear;
    });

    // 3) mode behavior
    if (mode === "random") {
      // random from filtered (0, 1, or many genres)
      setVisibleMovies(d3.shuffle([...filtered]).slice(0, filters.count));
    } else {
      // "top" mode with special handling:
      // - if no genres: top 25 by rating
      // - if one genre: top 25 by rating among that genre
      // - if multiple genres: sort by #matched tokens, then rating

      const withScores = filtered.map((movie) => {
        let score = 0;

        if (selectedGenres.length > 0) {
          const matches = movie.genre_token.filter((t) =>
            selectedGenres.includes(t)
          );
          score = matches.length; // more matched tokens = higher priority
        }

        const rating = Number(movie.rating) || 0;

        return { movie, score, rating };
      });

      withScores.sort((a, b) => {
        // first sort by match score (for multi-genre selections)
        if (b.score !== a.score) return b.score - a.score;
        // then sort by rating desc
        return b.rating - a.rating;
      });

      setVisibleMovies(withScores.map((x) => x.movie).slice(0, filters.count));
    }
  };

  // recompute when filters/mode/data change
  useEffect(() => {
    computeVisible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, mode, allMovies]);

  // refresh button:
  // - if random: reshuffle current filter result
  // - if top: recompute top order (useful if ratings change or you want to re-evaluate)
  const refreshList = () => {
    computeVisible();
  };

  return (
    <div className="recommendations-container">
      <NavBar active="recommendations" />

      <div className="content-area">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          mode={mode}
          setMode={setMode}
          refreshList={refreshList}
        />

        <div className="bubble-area">
          <BubbleChart
            data={visibleMovies}
            onMovieClick={(m) => setSelectedMovie(m)}
          />
        </div>
      </div>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { loadMovies } from "../data/loadMovies";
import type { Movie } from "../types/Movie";
import NavBar from "../components/NavBar";

import "../comp_css/Trends.css";

export default function TrendsPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    loadMovies().then((m) => setMovies(m));
  }, []);

  return (
    <div className="trends-container">
      <NavBar active="trends" />

      <div className="trends-content">
        <h2 className="trends-title">Movie Trends</h2>
        <p>work in progress</p>

        {movies.length === 0 ? (
          <p>Loading…</p>
        ) : (
          <div>
            <pre className="debug">
              loaded {movies.length} movies
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

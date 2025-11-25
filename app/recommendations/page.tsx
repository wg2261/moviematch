"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import NavBar from "../components/NavBar";
import BubbleChart from "../components/BubbleChart";
import MovieModal from "../components/MovieModal";
import FilterSidebar from "../components/FilterSidebar";
import "../comp_css/Recommendations.css";

type Movie = {
  title: string;
  duration: string;
  rating: string;
  description: string;
  movie_link: string;
  writers: string;
  directors: string;
  stars: string;
  release_date: string;
  countries_origin: string;
  production_companies: string;
  genres: string;
  year: string;
  month: string;
  day: string;
};

export default function RecommendationsPage() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [filters, setFilters] = useState({});

  // Load data
  useEffect(() => {
    (d3.csv("/cleaned_movies_100.csv") as Promise<Movie[]>).then((movies) => {
      setAllMovies(movies);
      setVisibleMovies(d3.shuffle([...movies]).slice(0, 25));
    });
  }, []);

  // TODO: filtering logic will go here later

  return (
    <div className="recommendations-container">
      <NavBar active={"recommendations"} />

      <div className="content-area">
        <FilterSidebar 
          filters={filters} 
          setFilters={setFilters} 
        />

        <div className="bubble-area">
          <BubbleChart 
            data={visibleMovies} 
            onMovieClick={(m) => setSelectedMovie(m)} 
          />
        </div>
      </div>

      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </div>
  );
}

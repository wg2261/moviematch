"use client";

import "../comp_css/MovieModal.css";

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

export default function MovieModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  if (!movie) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{movie.title}</h2>

        <p><strong>Rating:</strong> {movie.rating}</p>
        <p><strong>Duration:</strong> {movie.duration}</p>
        <p><strong>Genres:</strong> {movie.genres}</p>
        <p><strong>Release:</strong> {movie.release_date}</p>
        <p><strong>Directors:</strong> {movie.directors}</p>
        <p><strong>Writers:</strong> {movie.writers}</p>
        <p><strong>Stars:</strong> {movie.stars}</p>
        <p><strong>Production:</strong> {movie.production_companies}</p>
        <p><strong>Countries:</strong> {movie.countries_origin}</p>
        
        <p style={{ marginTop: "10px" }}>
          {movie.description}
        </p>

        {movie.movie_link && (
          <p>
            <a href={movie.movie_link} target="_blank">View Movie →</a>
          </p>
        )}

        <button className="modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

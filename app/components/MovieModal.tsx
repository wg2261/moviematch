"use client";

import type { Movie } from "../types/Movie";
import "../comp_css/MovieModal.css";

export default function MovieModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  if (!movie) return null;

  // helper to join lists safely
  const list = (arr?: string[]) =>
    Array.isArray(arr) ? arr.join(", ") : "N/A";

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">{movie.title}</h2>
        <p className="modal-description">{movie.description}</p>

        {movie.movie_link && (
          <a
            href={movie.movie_link}
            target="_blank"
            className="modal-watch-link"
          >
            View movie →
          </a>
        )}

        <p><strong>Rating:</strong> {movie.rating}</p>
        <p><strong>Duration:</strong> {movie.duration}</p>
        <p><strong>Genres:</strong> {list(movie.genres)}</p>
        <p><strong>Release:</strong> {movie.release_date}</p>
        <p><strong>Directors:</strong> {list(movie.directors)}</p>
        <p><strong>Writers:</strong> {list(movie.writers)}</p>
        <p><strong>Stars:</strong> {list(movie.stars)}</p>
        <p><strong>Production:</strong> {list(movie.production_companies)}</p>
        <p><strong>Origin Countries:</strong> {list(movie.countries_origin)}</p>

        <div className="modal-close-wrapper">
          <button className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

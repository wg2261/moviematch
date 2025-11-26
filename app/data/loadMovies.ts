import * as d3 from "d3";
import type { Movie } from "../types/Movie";

function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/[\[\]']+/g, "")  // remove brackets and quotes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function loadMovies(): Promise<Movie[]> {
  const rows = await d3.csv("/cleaned_movies_100.csv");

  return rows.map((r) => ({
    title: r.title ?? "",
    duration: r.duration ?? "",
    rating: r.rating ?? "",
    description: r.description ?? "",
    movie_link: r.movie_link ?? "",

    writers: parseList(r.writers),
    directors: parseList(r.directors),
    stars: parseList(r.stars),
    countries_origin: parseList(r.countries_origin),
    production_companies: parseList(r.production_companies),

    genres: parseList(r.genres),
    genre_token: parseList(r.genre_token),

    release_date: r.release_date ?? "",
    year: r.year ?? "",
    month: r.month ?? "",
    day: r.day ?? "",
  }));
}

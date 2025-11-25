"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "../comp_css/BubbleChart.css";

type Movie = {
  title: string;
  duration: string;
  rating: string;
  genres: string;
  description: string;
  movie_link: string;
  writers: string;
  directors: string;
  stars: string;
  release_date: string;
  countries_origin: string;
  production_companies: string;
  year: string;
  month: string;
  day: string;
};

const GENRE_COLORS: Record<string, string> = {
  Action: "#e63946",
  Adventure: "#48cae4",
  Animation: "#ffafcc",
  Anime: "#ffc8dd",
  "B-Action": "#9d4edd",
  "B-Horror": "#720026",
  Baseball: "#5c677d",
  Basketball: "#6b705c",
  Biography: "#3a5a40",
  Boxing: "#bc4749",
  Caper: "#f77f00",
  Comedy: "#ffb703",
  "Coming-of-Age": "#02c39a",
  Concert: "#7f5539",
  Crime: "#6d6875",
  Cyberpunk: "#7209b7",
  Disaster: "#0077b6",
  Docudrama: "#4361ee",
  Documentary: "#4cc9f0",
  Drama: "#2a9d8f",
  Epic: "#2f3e46",
  Family: "#ffddd2",
  Fantasy: "#bde0fe",
  Farce: "#ffb4a2",
  Football: "#1d3557",
  Gangster: "#5c3d2e",
  Giallo: "#fcbf49",
  Heist: "#9d0208",
  History: "#8d99ae",
  Holiday: "#0081a7",
  Horror: "#1d1e33",
  Isekai: "#cdb4db",
  Iyashikei: "#a2d2ff",
  Josei: "#ffcfd2",
  Kaiju: "#6a040f",
  Mecha: "#4d194d",
  Mockumentary: "#a78bfa",
  Motorsport: "#ef233c",
  Music: "#90e0ef",
  Musical: "#219ebc",
  Mystery: "#023047",
  News: "#adb5bd",
  Parody: "#f7b801",
  Quest: "#8ac926",
  Romance: "#ff6b6b",
  Samurai: "#5e548e",
  Satire: "#e5989b",
  "Sci-Fi": "#4cc9f0",
  Seinen: "#9e2a2b",
  Shōjo: "#ffb3c1",
  Shōnen: "#80ffdb",
  Slapstick: "#ffd166",
  Soccer: "#007f5f",
  Sport: "#40916c",
  Spy: "#6a4c93",
  "Stand-Up": "#ff4d6d",
  Steampunk: "#6d597a",
  Superhero: "#e71d36",
  Survival: "#335c67",
  Swashbuckler: "#b08968",
  Thriller: "#8d0801",
  Tragedy: "#6c757d",
  War: "#495057",
  Western: "#cc8b3c",
  Whodunnit: "#4b3f72",
  Wuxia: "#b5179e"
};

type Props = {
  data: Movie[];
  onMovieClick: (movie: Movie) => void;
};

export default function BubbleChart({ data, onMovieClick }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });

  // update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth; // bubble area = % of screen
      const h = window.innerHeight; // responsive height
      setDimensions({ width: w, height: h });
    };

    handleResize(); // initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const { width, height } = dimensions;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    svg.selectAll("*").remove();

    // Tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "#C6F7E7")
      .style("color", "black")
      .style("border", "2px solid white")
      .style("border-radius", "6px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const movies = data.map((m) => ({
      ...m,
      ratingValue: Number(m.rating) || 1,
    }));

    // Responsive radius scale
    const radius = d3
      .scaleLinear()
      .domain(d3.extent(movies, (d) => d.ratingValue) as [number, number])
      .range([width * 0.015, width * 0.04]);

    // Simulation
    const simulation = d3
      .forceSimulation(movies as any)
      .force("charge", d3.forceManyBody().strength(3))
      .force("collision", d3.forceCollide((d: any) => radius(d.ratingValue) + 3))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .on("tick", ticked);

    // Draw circles
    const nodes = svg
      .selectAll("circle")
      .data(movies)
      .enter()
      .append("circle")
      .attr("r", (d) => radius(d.ratingValue))
      .attr("fill", (d) => genreColor(d.genres))
      .attr("stroke", "none")
      .attr("stroke-width", 0)
      .style("cursor", "pointer")

      // open modal on click
      .on("click", (_, d) => {
        tooltip.style("opacity", 0);
        onMovieClick(d);
      })

      // hover effects
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.title}</strong><br/>
            Rating: ${d.rating}<br/>
            Year: ${d.year}<br/>
            Genre: ${d.genres}`
          )
          .style("left", event.clientX + "px")
          .style("top", event.clientY + 6 + "px");

        d3.select(event.currentTarget)
          .attr("fill-opacity", 0.6)
          .attr("stroke", "white")
          .attr("stroke-width", 3);
      })

      .on("mousemove", (event) => {
        tooltip
          .style("left", event.clientX)
          .style("top", event.clientY + 6 + "px");
      })

      .on("mouseleave", (event) => {
        tooltip.style("opacity", 0);

        d3.select(event.currentTarget)
          .attr("fill-opacity", 1)
          .attr("stroke", "none")
          .attr("stroke-width", 0);
      });

    // Simulation tick function
    function ticked() {
      nodes
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onMovieClick]);


  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
}

function genreColor(genre: string): string {
  if (!genre) return "#8ecae6";

  const key = Object.keys(GENRE_COLORS).find(g =>
    genre.toLowerCase().includes(g.toLowerCase())
  );

  return key ? GENRE_COLORS[key] : "#8ecae6";
}


"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Movie } from "../types/Movie";
import { GENRE_COLORS } from "../types/genreColors";
import "../comp_css/BubbleChart.css";
import React from "react";

type Props = {
  data: Movie[];
  onMovieClick: (movie: Movie) => void;
  highlightRange?: { startYear: number; endYear: number } | null;
};

type BubbleNode = Movie &
  d3.SimulationNodeDatum & {
    ratingValue: number;
  };

function genreColor(tokens?: string[]): string {
  if (!tokens || tokens.length === 0) return "#8ecae6";
  const movieTokens = tokens.map(t => t.toLowerCase());

  // loop through GENRE_COLORS in order
  for (const genreKey of Object.keys(GENRE_COLORS)) {
    const key = genreKey.toLowerCase();

    // match if ANY token contains the key OR if key contains token
    if (
      movieTokens.some(token =>
        token.includes(key) || key.includes(token)
      )
    ) {
      return GENRE_COLORS[genreKey];
    }
  }

  return "#f7cdf6ff";
}


export default React.memo(function BubbleChart({ data, onMovieClick, highlightRange }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // resize handler
  useEffect(() => {
  const resize = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 600;   // 给个合理兜底
    const height = rect.height || 380; // 底部区域大概这个高度就够了

    setDimensions({ width, height });
  };

  resize();
  window.addEventListener("resize", resize);
  return () => window.removeEventListener("resize", resize);
}, []);


  // Main draw effect
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const { width, height } = dimensions;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const tooltip = d3
      .select(tooltipRef.current)
      .attr("class", "bubble-tooltip")
      .style("opacity", 0);

    const nodes: BubbleNode[] = data.map((m) => ({
      ...m,
      ratingValue: Number(m.rating) || 1,
      x: width / 2,
      y: height / 2,
    }));

    const radius = d3
      .scaleLinear()
      .domain(d3.extent(nodes, (d) => d.ratingValue) as [number, number])
      .range([width * 0.02, width * 0.06]);

    const circles = svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => radius(d.ratingValue))
      .attr("fill", (d) => genreColor(d.genre_token))
      .attr("stroke", "white")
      .attr("stroke-width", 0.7)
      .style("cursor", "pointer")

      .on("click", (_, d) => {
        tooltip.style("opacity", 0);
        onMovieClick(d);
      })

      .on("mouseenter", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.title}</strong><br/>
             Rating: ${d.rating}<br/>
             Year: ${d.year}<br/>
             Genres: ${(d.genres || []).join(", ")}` 
          )
          .style("left", event.clientX - 200 + "px")
          .style("top", event.clientY - 40 + "px");

        if (!highlightRange){
          d3.select(this)
            .attr("fill-opacity", 0.7)
            .attr("stroke-width", 2);
        }
      })

      .on("mousemove", (event) => {
        tooltip
          .style("left", event.clientX - 200 + "px")
          .style("top", event.clientY - 40 + "px");
      })

      .on("mouseleave", function () {
        tooltip.style("opacity", 0);
        if (!highlightRange){
          d3.select(this)
            .attr("fill-opacity", 1)
            .attr("stroke-width", 0.7);
        }
      });

    // fully reset & recreate simulation everytime
    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-12))
      .force(
        "collision",
        d3.forceCollide<BubbleNode>((d) => radius(d.ratingValue) + 2).strength(1)
      )
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .velocityDecay(0.3)
      .alpha(1)
      .restart();

    simulation.on("tick", () => {
      circles.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
    });

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, highlightRange]);

    // highlight movies in certain range
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const circles = svg.selectAll<SVGCircleElement, BubbleNode>("circle");

    if (!highlightRange) {
      // recover
      circles
        .attr("fill-opacity", 1)
        .attr("stroke-width", 0.7);
      return;
    }

    const { startYear, endYear } = highlightRange;

    circles.each(function (d) {
      const y = Number(d.year);
      const inRange = y >= startYear && y <= endYear;
      d3.select(this)
        .attr("fill-opacity", inRange ? 1 : 0.15)
        .attr("stroke-width", inRange ? 2 : 0.3);
    });
  }, [highlightRange]);


  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
});

// app/components/GenreTreemap.tsx
"use client";

import React, { useMemo } from "react";
import * as d3 from "d3";
import type { Movie } from "../types/Movie";
import { GENRE_COLORS } from "../types/genreColors";
import "../comp_css/Trends.css";

export type YearRange = { startYear: number; endYear: number };

type Props = {
  data: Movie[];
  selectedRange: YearRange | null;
};

type GenreAgg = {
  name: string;
  count: number;
  avgRating: number | null;
};

type TreemapChild = {
  name: string;
  value: number;
  avgRating: number | null;
};

export default function GenreTreemap({ data, selectedRange }: Props) {
  const treemapNodes = useMemo(() => {
    if (!data || data.length === 0) return [] as d3.HierarchyRectangularNode<TreemapChild>[];

    // 1) 时间过滤：如果有 selectedRange，只保留这段时间的电影
    const filtered = selectedRange
      ? data.filter((m) => {
          const y = Number(m.year);
          return Number.isFinite(y) && y >= selectedRange.startYear && y <= selectedRange.endYear;
        })
      : data;

    if (filtered.length === 0) return [];

    // 2) 聚合到 genre
    const genreMap = new Map<string, { count: number; sumRating: number; nRating: number }>();

    for (const m of filtered) {
      // 优先使用 genres（更友好），没有就退回 genre_token
      const genreList = (m.genres && m.genres.length > 0 ? m.genres : m.genre_token) ?? [];
      if (genreList.length === 0) continue;

      const rating = Number(m.rating);
      const hasRating = !Number.isNaN(rating) && rating > 0;

      for (const raw of genreList) {
        const g = raw.trim();
        if (!g) continue;

        if (!genreMap.has(g)) {
          genreMap.set(g, { count: 0, sumRating: 0, nRating: 0 });
        }
        const agg = genreMap.get(g)!;
        agg.count += 1;
        if (hasRating) {
          agg.sumRating += rating;
          agg.nRating += 1;
        }
      }
    }

    let genres: GenreAgg[] = Array.from(genreMap.entries()).map(([name, agg]) => ({
      name,
      count: agg.count,
      avgRating: agg.nRating > 0 ? agg.sumRating / agg.nRating : null,
    }));

    if (genres.length === 0) return [];

    // 3) 取 top N，其余合并为 "Other"
    genres.sort((a, b) => b.count - a.count);
    const TOP_N = 12;
    const top = genres.slice(0, TOP_N);
    const rest = genres.slice(TOP_N);

    if (rest.length > 0) {
      const totalCount = rest.reduce((s, g) => s + g.count, 0);
      const sumRating = rest.reduce(
        (s, g) => (g.avgRating != null ? s + g.avgRating * g.count : s),
        0
      );
      const nRating = rest.reduce(
        (s, g) => (g.avgRating != null ? s + g.count : s),
        0
      );
      top.push({
        name: "Other",
        count: totalCount,
        avgRating: nRating > 0 ? sumRating / nRating : null,
      });
    }

    const children: TreemapChild[] = top.map((g) => ({
      name: g.name,
      value: g.count,
      avgRating: g.avgRating,
    }));

    const root = d3
      .hierarchy<{ children: TreemapChild[] } & TreemapChild>(
        { name: "root", value: 0, avgRating: null, children },
        (d) => d.children
      )
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const width = 520;
    const height = 320;

    d3.treemap< TreemapChild >()
      .size([width, height])
      .paddingInner(3)
      .round(true)(root as any);

    return root.leaves();
  }, [data, selectedRange]);

  // rating → color
  const colorScale = d3
  .scaleQuantize<string>()
  .domain([5, 9]) // 评分区间，大部分电影在 5~9 之间
  .range([
    "#2b2b2b", // 低分：几乎黑
    "#33415c", // 稍低：暗蓝灰
    "#335c67", // 中等：蓝绿
    "#008b8b", // 中高：青色
    "#f4d35e"  // 高分：亮黄，非常显眼
  ]);


  const titleText = selectedRange
    ? `Popular genres (${selectedRange.startYear}–${selectedRange.endYear})`
    : "Popular genres (current filters)";

  return (
    <div className="treemap-wrapper">
      <h3 className="treemap-title">{titleText}</h3>
      <p className="treemap-subtitle">
        Area shows how many movies each genre has; color reflects average rating.
      </p>

      {treemapNodes.length === 0 ? (
        <p className="trends-empty">No genre data for this time range.</p>
      ) : (
        <div className="treemap-svg-container">
          <svg
            className="treemap-svg"
            viewBox="0 0 520 320"
            role="img"
          >
            {treemapNodes.map((node) => {
              const d = node.data;
              const avg = d.avgRating ?? 0;
              let fill = "#333333";

              if (avg > 0) {
                fill = colorScale(avg);
              }

              const label = d.name;
              const count = d.value ?? 0;

              const x = node.x0;
              const y = node.y0;
              const w = node.x1 - node.x0;
              const h = node.y1 - node.y0;

              const showLabel = w > 60 && h > 30;

              return (
                <g key={d.name}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={fill}
                    stroke="#C7F7E7"
                    strokeWidth={1}
                    rx={4}
                    ry={4}
                  >
                    <title>
                      {`${d.name}
                        Movies: ${count}
                        Avg rating: ${
                        d.avgRating != null ? d.avgRating.toFixed(2) : "N/A"
                      }`}
                    </title>
                  </rect>

                  {showLabel && (
                    <g>
                      <text
                        x={x + 6}
                        y={y + 18}
                        fill="#ffffff"
                        fontSize={Math.min(14, w * 0.12, h * 0.3)}
                        fontWeight={600}
                        style={{ pointerEvents: "none" }}
                      >
                        {label.length > 12 ? label.slice(0, 12) + "…" : label}
                      </text>
                      <text
                        x={x + 6}
                        y={y + 32}
                        fill="#C7F7E7"
                        fontSize={Math.min(12, w * 0.1, h * 0.22)}
                        style={{ pointerEvents: "none" }}
                      >
                        {count} movie{count === 1 ? "" : "s"}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
      </div>
      )}
    </div>
  );
}

// app/components/TrendChart.tsx
"use client";

import React from "react";
import * as d3 from "d3";
import type { Movie } from "../types/Movie";
import "../comp_css/Trends.css";

export type GroupMode = "decade" | "year";
export type YearRange = { startYear: number; endYear: number };

type Props = {
  data: Movie[];
  mode: GroupMode;
  selectedRange: YearRange | null;
  onRangeChange?: (range: YearRange | null) => void;
};

type TrendDatum = {
  key: number;      // decade 起始或年份
  label: string;    // "1960s" 或 "1963"
  count: number;
  avgRating: number | null;
};

export default function TrendChart({
  data,
  mode,
  selectedRange,
  onRangeChange,
}: Props) {
  // 1. 聚合
  const trendData: TrendDatum[] = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    const buckets = new Map<
      number,
      { count: number; sumRating: number; nRating: number }
    >();

    for (const m of data) {
      if (!m.year) continue;
      const yearNum = Number(m.year);
      if (!Number.isFinite(yearNum)) continue;

      const key = mode === "decade" ? Math.floor(yearNum / 10) * 10 : yearNum;

      if (!buckets.has(key)) {
        buckets.set(key, { count: 0, sumRating: 0, nRating: 0 });
      }
      const bucket = buckets.get(key)!;
      bucket.count += 1;

      const r = Number(m.rating);
      if (!Number.isNaN(r) && r > 0) {
        bucket.sumRating += r;
        bucket.nRating += 1;
      }
    }

    return Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([key, stats]) => ({
        key,
        label: mode === "decade" ? `${key}s` : String(key),
        count: stats.count,
        avgRating: stats.nRating > 0 ? stats.sumRating / stats.nRating : null,
      }));
  }, [data, mode]);

  if (trendData.length === 0) {
    return (
      <div className="trends-empty">
        No movies match the current filters. Try adjusting the year range or genres.
      </div>
    );
  }

  // 👉 横轴 label 抽样：year 模式最多 ~10 个刻度，decade 全部显示
  const maxLabels = mode === "year" ? 10 : trendData.length;
  const labelStep = Math.max(1, Math.ceil(trendData.length / maxLabels));

  // 2. D3 标尺
  const width = 820;
  const height = 420;
  const margin = { top: 30, right: 70, bottom: 60, left: 50 };

  const x = d3
    .scaleBand<string>()
    .domain(trendData.map((d) => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.25);

  const yRating = d3
    .scaleLinear()
    .domain([0, 10])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const maxCount = d3.max(trendData, (d) => d.count) ?? 1;

  const yCount = d3
    .scaleLinear()
    .domain([0, maxCount])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line<TrendDatum>()
    .x((d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
    .y((d) => (d.avgRating != null ? yRating(d.avgRating) : yRating(0)))
    .defined((d) => d.avgRating != null);

  // 计算某个 bucket 对应的年份区间
  const getRange = (d: TrendDatum): YearRange => {
    if (mode === "decade") {
      return { startYear: d.key, endYear: d.key + 9 };
    }
    return { startYear: d.key, endYear: d.key };
  };

  const isSameRange = (a: YearRange | null, b: YearRange | null) => {
    if (!a || !b) return false;
    return a.startYear === b.startYear && a.endYear === b.endYear;
  };

  const handleBucketClick = (range: YearRange) => {
    if (!onRangeChange) return;
    if (isSameRange(selectedRange, range)) {
      // 再次点击同一个 → 取消选中
      onRangeChange(null);
    } else {
      onRangeChange(range);
    }
  };

  return (
    <div className="trends-chart-wrapper">
      <div className="trends-chart-header">
        <h2 className="trends-title">Long-Term Movie Trends</h2>
        <p className="trends-subtitle">
          Each bar shows how many movies were released, and the line shows the average IMDb rating.
        </p>
      </div>

      <div className="trends-legend">
        <div className="trends-legend-item">
          <span className="trends-legend-swatch trends-swatch-bar" />
          <span>Movie count</span>
        </div>
        <div className="trends-legend-item">
          <span className="trends-legend-swatch trends-swatch-line" />
          <span>Average IMDb rating</span>
        </div>
      </div>

      <div className="trends-svg-container">
        <svg
          className="trends-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
        >
          {/* 背景点击区域：点击空白处清除选中 */}
          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="transparent"
            onClick={() => onRangeChange?.(null)}
          />

          {/* X 轴刻度 & label（按 step 抽样） */}
          {trendData.map((d, i) => {
            const xPos = (x(d.label) ?? 0) + x.bandwidth() / 2;
            const yBase = height - margin.bottom;
            const showLabel = mode === "decade" || i % labelStep === 0;

            return (
              <g key={d.label} transform={`translate(${xPos},0)`}>
                <line
                  x1={0}
                  x2={0}
                  y1={yBase}
                  y2={yBase + 6}
                  className="trends-axis-tick"
                />
                {showLabel && (
                  <text
                    x={0}
                    y={yBase + 22}
                    textAnchor="middle"
                    className="trends-axis-label"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* 左侧 Y：rating + 网格线 */}
          {d3.ticks(0, 10, 5).map((t) => {
            const yPos = yRating(t);
            return (
              <g key={`rating-${t}`}>
                <line
                  x1={margin.left - 4}
                  x2={margin.left}
                  y1={yPos}
                  y2={yPos}
                  className="trends-axis-tick"
                />
                <text
                  x={margin.left - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="trends-axis-label"
                >
                  {t}
                </text>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={yPos}
                  y2={yPos}
                  className="trends-grid-line"
                />
              </g>
            );
          })}

          {/* 右侧 Y：count */}
          {d3.ticks(0, maxCount, 4).map((t) => {
            const yPos = yCount(t);
            return (
              <g key={`count-${t}`}>
                <line
                  x1={width - margin.right}
                  x2={width - margin.right + 4}
                  y1={yPos}
                  y2={yPos}
                  className="trends-axis-tick"
                />
                <text
                  x={width - margin.right + 8}
                  y={yPos + 4}
                  textAnchor="start"
                  className="trends-axis-label"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* 柱子：click 选中 / 取消 */}
          {trendData.map((d) => {
            const xPos = x(d.label) ?? 0;
            const barWidth = x.bandwidth();
            const yPos = yCount(d.count);
            const yBase = height - margin.bottom;
            const barHeight = Math.max(0, yBase - yPos);
            const range = getRange(d);
            const isSelected = isSameRange(selectedRange, range);

            return (
              <g key={`bar-${d.label}`}>
                <rect
                  x={xPos}
                  y={yPos}
                  width={barWidth}
                  height={barHeight}
                  className={
                    "trends-bar" + (isSelected ? " trends-bar-selected" : "")
                  }
                  onClick={(e) => {
                    // 阻止冒泡到背景 rect
                    e.stopPropagation();
                    handleBucketClick(range);
                  }}
                >
                  <title>{`${d.label}: ${d.count} movies`}</title>
                </rect>
              </g>
            );
          })}

          {/* 折线 */}
          <path d={line(trendData) ?? ""} className="trends-line" />

          {/* 折线上的点：同样支持 click 选中 */}
          {trendData
            .filter((d) => d.avgRating != null)
            .map((d) => {
              const xPos = (x(d.label) ?? 0) + x.bandwidth() / 2;
              const yPos = yRating(d.avgRating as number);
              const range = getRange(d);
              const isSelected = isSameRange(selectedRange, range);

              return (
                <g key={`dot-${d.label}`}>
                  <circle
                    cx={xPos}
                    cy={yPos}
                    r={isSelected ? 5 : 4}
                    className="trends-line-dot"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBucketClick(range);
                    }}
                  >
                    <title>
                      {`${d.label}: avg rating ${(d.avgRating as number).toFixed(2)}`}
                    </title>
                  </circle>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
}

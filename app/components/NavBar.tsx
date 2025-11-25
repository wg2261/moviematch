"use client";

import Link from "next/link";
import "../comp_css/NavBar.css";

export default function NavBar({ active }: { active: "recommendations" | "trends" }) {
  return (
    <div className="nav-bar">
      <div className="nav-title">MovieMatch</div>

      <div className="nav-links">
        {active === "recommendations" ? (
          <span className="nav-link nav-active">Recommendations</span>
        ) : (
          <Link href="/recommendations" className="nav-link">Recommendations</Link>
        )}

        {active === "trends" ? (
          <span className="nav-link nav-active">Trends</span>
        ) : (
          <Link href="/trends" className="nav-link">Trends</Link>
        )}
      </div>
    </div>
  );
}

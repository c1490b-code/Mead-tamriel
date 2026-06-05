import React, { useState } from "react";
import { YEAST_PROFILES } from "../data/yeasts";
import { Search, Compass, ShieldCheck, Thermometer } from "lucide-react";

export function YeastExplorer() {
  const [search, setSearch] = useState("");
  const [demandFilter, setDemandFilter] = useState<string>("All");

  const filtered = YEAST_PROFILES.filter((y) => {
    const matchesSearch =
      y.name.toLowerCase().includes(search.toLowerCase()) ||
      y.description.toLowerCase().includes(search.toLowerCase()) ||
      y.styles.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesDemand =
      demandFilter === "All" || y.nitrogenRequirement === demandFilter;

    return matchesSearch && matchesDemand;
  });

  return (
    <div className="bg-white rounded-none border border-[#E5E1DA] shadow-xs p-6 md:p-8" id="yeast-explorer-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Microbiology Catalog</p>
          <h3 className="text-xl font-serif text-[#1C1917]" id="yeast-explorer-title">Yeast Profile Explorer</h3>
          <p className="text-xs text-[#78716C] mt-1">
            Browse and inspect standard craft mead yeasts, alcohol tolerances, and nitrogen requirements.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search yeast or style..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-[#E5E1DA] rounded-none text-xs font-mono text-[#2D2A26] focus:outline-hidden focus:border-[#D97706] w-48 focus:w-64 transition-all duration-200"
              id="search-yeast-input"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Nitrogen demand select */}
          <select
            value={demandFilter}
            onChange={(e) => setDemandFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E5E1DA] rounded-none text-xs text-[#2D2A26] font-semibold focus:outline-hidden focus:border-[#D97706]"
            id="filter-yeast-nitrogen"
          >
            <option value="All">All Nitrogen Demands</option>
            <option value="Low">Low Nutrition</option>
            <option value="Medium">Medium Nutrition</option>
            <option value="High">High Nutrition</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((y) => (
            <div
              key={y.name}
              className="border border-[#E5E1DA] rounded-none bg-white p-5 hover:border-[#1C1917] shadow-2xs transition-all duration-200 flex flex-col justify-between"
              id={`yeast-card-${y.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-2xs font-bold text-[#A8A29E] tracking-widest uppercase block">{y.brand}</span>
                    <h4 className="text-base font-serif font-medium text-[#1C1917] mt-0.5">{y.name}</h4>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-none font-bold tracking-wider uppercase border ${
                      y.nitrogenRequirement === "Low"
                        ? "bg-[#F1F5F9] text-gray-700 border-[#E2E8F0]"
                        : y.nitrogenRequirement === "Medium"
                        ? "bg-[#FEF3C7] text-amber-800 border-[#FDE68A]"
                        : "bg-[#FEE2E2] text-red-00 border-[#FCA5A5]"
                    }`}
                  >
                    YAN: {y.nitrogenRequirement}
                  </span>
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed mt-3">{y.description}</p>

                {/* Compatibility tags */}
                <div className="flex flex-wrap gap-1 mt-4">
                  {y.styles.map((s) => (
                    <span
                      key={s}
                      className="bg-[#FDFCFB] text-[#78716C] border border-[#E5E1DA] text-2xs px-2 py-0.5 rounded-none font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specifications row */}
              <div className="border-t border-[#E5E1DA] pt-3 mt-4 grid grid-cols-2 gap-2 text-2xs text-[#78716C] font-semibold font-sans uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                  <span>Max: <span className="font-bold text-[#1C1917] font-mono">{y.alcoholTolerance}%</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
                  <span>Temp: <span className="font-bold text-[#1C1917] font-mono">{y.tempRangeMinF}–{y.tempRangeMaxF}°F</span></span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-[#78716C] font-sans">
            No yeasts match your criteria. Try resetting filters or terms!
          </div>
        )}
      </div>

      <div className="bg-[#FDFCFB] rounded-none p-4 flex gap-3 text-2xs text-[#78716C] border border-[#E5E1DA] mt-6 leading-relaxed">
        <Compass className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#1C1917] block mb-0.5 uppercase tracking-wide text-[10px]">Yeast Nitrogen Requirements (YAN)</span>
          Mead must made of honey and water has almost zero organic nitrogen. Yeast requires nitrogen additions (Yeast Assimilable Nitrogen or YAN) to ferment cleanly. **Low** demand yeasts need fewer additions and are highly resilient, whereas **High** demand strains require meticulous staging list items to prevent sulfur stalls.
        </div>
      </div>
    </div>
  );
}

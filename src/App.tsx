import React, { useState, useEffect } from "react";
import { BrewLog } from "./types";
import { Calculators } from "./components/Calculators";
import { YeastExplorer } from "./components/YeastExplorer";
import { RecipeGen } from "./components/RecipeGen";
import { LogJournal } from "./components/LogJournal";
import {
  Beer,
  Sparkles,
  FlaskConical,
  Compass,
  Layers,
  BookOpen,
  Info
} from "lucide-react";

const SEED_LOGS: BrewLog[] = [
  {
    id: "seed-sunset-melomel",
    batchName: "Sunset Orange Blossom Melomel",
    style: "Melomel (Fruit)",
    honeyType: "Orange Blossom Honey",
    yeastName: "Lalvin 71B",
    batchSize: 3,
    batchSizeUnit: "gal",
    originalGravity: 1.095,
    finalGravity: 1.002,
    dateStarted: "2026-05-10",
    status: "Racked/Aging",
    notes: "Artisanal Specs: Orange blossom honey + 6 lbs of fresh sliced peaches and 2 Madagascar vanilla beans added in carboy secondary phase. Staggered Fermaid O schedule successfully complete.",
    gravityReadings: [
      { id: "s1", date: "2026-05-10", gravity: 1.095, correctedGravity: 1.095, notes: "Pitched yeast" },
      { id: "s2", date: "2026-05-13", gravity: 1.072, correctedGravity: 1.072, notes: "Healthy active bubbles. Added 2nd nutrient dose." },
      { id: "s3", date: "2026-05-17", gravity: 1.041, correctedGravity: 1.041, notes: "Sugar break hit. Filtered, added 3rd nutrient dose." },
      { id: "s4", date: "2026-05-22", gravity: 1.015, correctedGravity: 1.015, notes: "Fragrant sweet citrus nodes present." },
      { id: "s5", date: "2026-05-28", gravity: 1.003, correctedGravity: 1.003, notes: "Primary complete. Racking target." }
    ],
    timelineEvents: [
      { id: "t1", date: "2026-05-10", type: "addition", description: "Pitched Lalvin 71B yeast must and added 1st nutrient dose" },
      { id: "t2", date: "2026-05-13", type: "addition", description: "Degassed must and added 2nd nutrient addition" },
      { id: "t3", date: "2026-05-17", type: "addition", description: "1/3 Sugar break hit at 1.063. Added final nutrient dose" },
      { id: "t4", date: "2026-05-28", type: "rack", description: "Racked mead to carboy secondary and infused with peaches and vanilla beans." }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"journal" | "ai" | "calcs" | "yeasts">("journal");
  const [logs, setLogs] = useState<BrewLog[]>([]);

  // Initialize and load from local storage
  useEffect(() => {
    const stored = localStorage.getItem("mead_brew_logs_storage");
    if (stored) {
      try {
        setLogs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse mead brew logs", e);
        setLogs(SEED_LOGS);
      }
    } else {
      // Seed initial batch for gorgeous demonstration dashboard
      setLogs(SEED_LOGS);
      localStorage.setItem("mead_brew_logs_storage", JSON.stringify(SEED_LOGS));
    }
  }, []);

  // Sync to local storage
  const syncLogs = (updated: BrewLog[]) => {
    setLogs(updated);
    localStorage.setItem("mead_brew_logs_storage", JSON.stringify(updated));
  };

  const handleAddLog = (newLog: BrewLog) => {
    const next = [newLog, ...logs];
    syncLogs(next);
  };

  const handleUpdateLog = (updatedLog: BrewLog) => {
    const next = logs.map((l) => (l.id === updatedLog.id ? updatedLog : l));
    syncLogs(next);
  };

  const handleActionOnSaveGenerated = (generatedLog: BrewLog) => {
    handleAddLog(generatedLog);
    setActiveTab("journal"); // redirect to logs so they can immediately see the tracked mead!
  };

  const handleDeleteLog = (id: string) => {
    const next = logs.filter((l) => l.id !== id);
    syncLogs(next);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2A26] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-950">
      
      {/* Premium Header Layout */}
      <header className="bg-white border-b border-[#E5E1DA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D97706] rounded-sm flex items-center justify-center text-white font-bold font-display shadow-sm">
              <Beer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-[#4A453E] flex items-center gap-1.5 leading-none uppercase">
                MAZER HEARTH
              </h1>
              <p className="text-[10px] uppercase font-bold text-[#A8A29E] tracking-widest mt-1">Brewing Companion</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex space-x-6 text-xs font-bold uppercase tracking-widest text-[#78716C]">
            <button
              onClick={() => setActiveTab("journal")}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                activeTab === "journal"
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#78716C] hover:text-[#D97706]"
              }`}
              id="nav-journal-tab"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Cellar Journal
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                activeTab === "ai"
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#78716C] hover:text-[#D97706]"
              }`}
              id="nav-ai-tab"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              AI Synthesizer
            </button>
            <button
              onClick={() => setActiveTab("calcs")}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                activeTab === "calcs"
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#78716C] hover:text-[#D97706]"
              }`}
              id="nav-calcs-tab"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Calculators
            </button>
            <button
              onClick={() => setActiveTab("yeasts")}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                activeTab === "yeasts"
                  ? "border-[#D97706] text-[#D97706]"
                  : "border-transparent text-[#78716C] hover:text-[#D97706]"
              }`}
              id="nav-yeasts-tab"
            >
              <Compass className="w-3.5 h-3.5" />
              Yeast Library
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dynamic Rendering of Views */}
        <div className="space-y-8">
          
          {activeTab === "journal" && (
            <LogJournal
              logs={logs}
              onAddLog={handleAddLog}
              onUpdateLog={handleUpdateLog}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {activeTab === "ai" && (
            <RecipeGen onSaveToLogs={handleActionOnSaveGenerated} />
          )}

          {activeTab === "calcs" && (
            <Calculators />
          )}

          {activeTab === "yeasts" && (
            <YeastExplorer />
          )}

        </div>
      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-[#E5E1DA] py-6 text-center mt-12">
        <p className="text-[10px] text-[#A8A29E] font-sans tracking-[0.25em] uppercase font-bold">
          Mead Brewing Companion • Built with pristine geometric balance for modern Mazers
        </p>
      </footer>
    </div>
  );
}

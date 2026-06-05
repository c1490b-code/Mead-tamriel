import React, { useState } from "react";
import { BrewLog, GravityReading, TimelineEvent } from "../types";
import {
  Beer,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Trash2,
  Plus,
  ArrowLeft,
  Activity,
  PlusCircle,
  FolderLock,
  BadgeAlert,
  Compass,
  Check
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface LogJournalProps {
  logs: BrewLog[];
  onAddLog: (log: BrewLog) => void;
  onUpdateLog: (log: BrewLog) => void;
  onDeleteLog: (id: string) => void;
}

const STYLES = ["Traditional", "Melomel (Fruit)", "Metheglin (Spiced)", "Cyser (Apple Cider)", "Pyment (Grape)", "Acerglyn (Maple)", "Bochet (Caramelized Honey)", "Hydromel (Session)"];

export function LogJournal({ logs, onAddLog, onUpdateLog, onDeleteLog }: LogJournalProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form for manual new mead log
  const [newBatchName, setNewBatchName] = useState("");
  const [newStyle, setNewStyle] = useState("Traditional");
  const [newHoney, setNewHoney] = useState("");
  const [newYeast, setNewYeast] = useState("");
  const [newVolume, setNewVolume] = useState<number>(1.0);
  const [newOg, setNewOg] = useState<number>(1.090);
  const [newTargetFg, setNewTargetFg] = useState<number>(1.000);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newNotes, setNewNotes] = useState("");

  // Fields for logging a new gravity entry
  const [logGravity, setLogGravity] = useState<number>(1.050);
  const [logTemp, setLogTemp] = useState<number>(70);
  const [applyTempCorrection, setApplyTempCorrection] = useState(false);
  const [logNotes, setLogNotes] = useState("");
  const [showGravForm, setShowGravForm] = useState(false);

  // Fields for logging a manual event
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventType, setNewEventType] = useState<"addition" | "rack" | "bottle" | "taste" | "other">("other");
  const [showEventForm, setShowEventForm] = useState(false);

  const selectedLog = logs.find((l) => l.id === selectedLogId);

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) return;

    const created: BrewLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      batchName: newBatchName,
      style: newStyle,
      honeyType: newHoney || "Clover Honey",
      yeastName: newYeast || "Lalvin D47",
      batchSize: newVolume,
      batchSizeUnit: "gal",
      originalGravity: newOg,
      finalGravity: newTargetFg,
      dateStarted: newDate,
      status: "Fermenting",
      notes: newNotes,
      gravityReadings: [
        {
          id: Math.random().toString(36).substring(2, 9),
          date: newDate,
          gravity: newOg,
          correctedGravity: newOg,
          notes: "Initial Batch Pitch gravity"
        }
      ],
      timelineEvents: [
        {
          id: Math.random().toString(36).substring(2, 9),
          date: newDate,
          type: "addition",
          description: "Staged ingredients, adjusted ph, pitched yeast"
        }
      ]
    };

    onAddLog(created);
    
    // reset form
    setNewBatchName("");
    setNewHoney("");
    setNewYeast("");
    setNewOg(1.090);
    setNewTargetFg(1.000);
    setNewNotes("");
    setShowAddForm(false);
    setSelectedLogId(created.id);
  };

  const handleAddGravityReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;

    // Optional temperature correction
    let finalGrav = logGravity;
    if (applyTempCorrection) {
      // Correcting assumes calibration at 60F
      const tempF = logTemp; // simplistic temp formula correction reference on site
      const factorAtT = 1.313454e-3 - 1.326743e-4 * tempF + 2.057793e-6 * Math.pow(tempF, 2) - 2.627634e-9 * Math.pow(tempF, 3);
      const factorAtCal = 1.313454e-3 - 1.326743e-4 * 60 + 2.057793e-6 * Math.pow(60, 2) - 2.627634e-9 * Math.pow(60, 3);
      finalGrav = Number((logGravity + (factorAtT - factorAtCal)).toFixed(4));
    }

    const newReading: GravityReading = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split("T")[0],
      gravity: logGravity,
      temperature: applyTempCorrection ? logTemp : undefined,
      tempUnit: "F",
      correctedGravity: finalGrav,
      notes: logNotes || undefined
    };

    // Auto-generate a timeline action for this gravity reading
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substring(2, 9),
      date: newReading.date,
      type: "gravity",
      description: `Gravity measured at ${finalGrav.toFixed(3)}${applyTempCorrection ? ` (Corrected from ${logGravity.toFixed(3)} @ ${logTemp}°F)` : ""}.${logNotes ? ` Note: ${logNotes}` : ""}`
    };

    const updatedLog: BrewLog = {
      ...selectedLog,
      gravityReadings: [...selectedLog.gravityReadings, newReading].sort((a, b) => a.date.localeCompare(b.date)),
      timelineEvents: [...selectedLog.timelineEvents, newEvent].sort((a, b) => a.date.localeCompare(b.date))
    };

    onUpdateLog(updatedLog);
    setLogGravity(1.010);
    setLogNotes("");
    setApplyTempCorrection(false);
    setShowGravForm(false);
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog || !newEventDesc.trim()) return;

    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split("T")[0],
      type: newEventType,
      description: newEventDesc
    };

    const updatedLog: BrewLog = {
      ...selectedLog,
      timelineEvents: [...selectedLog.timelineEvents, newEvent].sort((a, b) => a.date.localeCompare(b.date))
    };

    onUpdateLog(updatedLog);
    setNewEventDesc("");
    setShowEventForm(false);
  };

  const handleStatusChange = (newStatus: BrewLog["status"]) => {
    if (!selectedLog) return;

    const transitionEvent: TimelineEvent = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split("T")[0],
      type: newStatus === "Bottled" ? "bottle" : newStatus === "Racked/Aging" ? "rack" : "other",
      description: `Transitioned batch stage from ${selectedLog.status} to: ${newStatus}`
    };

    const updatedLog: BrewLog = {
      ...selectedLog,
      status: newStatus,
      timelineEvents: [...selectedLog.timelineEvents, transitionEvent].sort((a, b) => a.date.localeCompare(b.date))
    };

    onUpdateLog(updatedLog);
  };

  // Helper: calculate live ABV of a log based on its most recent gravity reading
  const getLiveABV = (log: BrewLog) => {
    if (log.gravityReadings.length === 0) return 0;
    const latest = log.gravityReadings[log.gravityReadings.length - 1].correctedGravity;
    const og = log.originalGravity;
    if (og <= latest) return 0;
    // Advanced gravity equation for high craft meads
    const abv = (76.08 * (og - latest) / (2.0665 - og)) * (100 / latest);
    return isNaN(abv) ? 0 : Number(abv.toFixed(2));
  };

  const getLatestGravity = (log: BrewLog) => {
    if (log.gravityReadings.length === 0) return log.originalGravity;
    return log.gravityReadings[log.gravityReadings.length - 1].correctedGravity;
  };

  // Calculate approximate completion based on starting and current gravity versus target FG
  const getProgressPercentage = (log: BrewLog) => {
    const start = log.originalGravity;
    const current = getLatestGravity(log);
    const target = log.finalGravity;

    if (start <= target || start <= current) return 0;
    const totalPotentialDrop = start - target;
    const actualDrop = start - current;

    const percent = (actualDrop / totalPotentialDrop) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  };

  return (
    <div className="bg-white rounded-sm border border-[#E5E1DA] shadow-xs overflow-hidden" id="brew-journal-section">
      
      {/* 1. LISTING MODE */}
      {!selectedLog && !showAddForm && (
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-[#D97706] font-bold text-xs uppercase tracking-[0.2em] mb-1">Cellar Records</p>
              <h2 className="text-3xl font-serif text-[#1C1917] leading-none mb-1" id="journal-heading">Active Batches & Archives</h2>
              <p className="text-xs text-[#78716C]">Chronicle gravity logs, aging charts, and cellar statuses of your custom meads.</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#D97706] hover:bg-[#c26a05] text-white font-bold text-xs rounded-sm tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-1.5"
              id="add-batch-btn"
            >
              <Plus className="w-4 h-4 text-white" />
              Log Manual Batch
            </button>
          </div>

          {logs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {logs.map((log) => {
                const currentGrav = getLatestGravity(log);
                const abv = getLiveABV(log);
                const progress = getProgressPercentage(log);

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className="group border border-[#E5E1DA] p-5 rounded-none hover:border-[#D97706] bg-white transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 relative"
                    id={`batch-log-card-${log.id}`}
                  >
                    <div>
                      {/* Status / Date Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#A8A29E] font-sans">
                          <PlusCircle className="w-3.5 h-3.5 text-gray-300" />
                          Started {log.dateStarted}
                        </span>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none ${
                            log.status === "Fermenting"
                              ? "bg-amber-50 text-amber-800 border border-amber-200/50"
                              : log.status === "Racked/Aging"
                              ? "bg-purple-50 text-purple-800 border border-purple-200/50"
                              : log.status === "Bottled"
                              ? "bg-green-50 text-green-800 border border-green-200/50"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>

                      {/* Title & Style */}
                      <h3 className="text-lg font-serif font-semibold text-[#1C1917] group-hover:text-[#D97706] transition-colors mt-1 pr-1 truncate">
                        {log.batchName}
                      </h3>
                      <div className="text-[11px] text-[#78716C] font-semibold mt-0.5">
                        {log.style} • {log.honeyType} • {log.batchSize} gal Must
                      </div>
                    </div>

                    <div className="mt-4">
                      {/* Gravity Progress Bar */}
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] mb-1.5 font-sans">
                        <span>Ferment: {progress}% Complete</span>
                        <span className="font-mono text-[#1C1917]">SG {currentGrav.toFixed(3)}</span>
                      </div>
                      <div className="w-full bg-[#F5F5F4] h-1 rounded-none overflow-hidden">
                        <div
                          className="bg-[#D97706] h-full rounded-none transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {/* Spark ABV row */}
                      <div className="flex justify-between items-center border-t border-[#F5F5F4] pt-2 mt-3 text-2xs">
                        <span className="text-[#A8A29E] font-bold uppercase tracking-wider">Yeast: <span className="text-[#2D2A26] font-mono">{log.yeastName}</span></span>
                        <span className="font-bold text-white bg-[#1C1917] px-2 py-0.5 rounded-none font-mono tracking-wider text-[10px]">{abv}% ABV</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-[#E5E1DA] rounded-none bg-[#F5F5F4]/30">
              <Beer className="w-10 h-10 text-amber-500/30 mx-auto mb-3" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#4A453E]">Cellar Empty</h4>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto mt-1 leading-normal">
                You haven't logged any batches of mead! Synthesize a recipe above and click **"Track Batch in Journal"** or click **"Log Manual Batch"** to chronicle your brew today.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. MANUAL BATCH LOG FORM */}
      {showAddForm && (
        <form onSubmit={handleCreateLog} className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E1DA] pb-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 px-2 border border-[#E5E1DA] rounded-sm text-[#78716C] hover:text-[#2D2A26] text-xs font-semibold flex items-center gap-1 bg-white"
              type="button"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h3 className="text-lg font-serif text-[#1C1917]">Register Brewing Log Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Batch Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Cherry Chipotle Metheglin"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] focus:outline-hidden focus:ring-1 focus:ring-[#D97706] focus:border-[#D97706]"
                id="form-batch-name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Style of Mead</label>
              <select
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] focus:outline-hidden focus:border-[#D97706]"
                id="form-style"
              >
                {STYLES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Varietal Honey Type</label>
              <input
                type="text"
                placeholder="e.g. Orange Blossom"
                value={newHoney}
                onChange={(e) => setNewHoney(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Yeast Pitch Strain</label>
              <input
                type="text"
                placeholder="e.g. Lalvin D47"
                value={newYeast}
                onChange={(e) => setNewYeast(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Volume (Gallon)</label>
                <input
                   type="number"
                   step="0.1"
                   min="0.1"
                   value={newVolume}
                   onChange={(e) => setNewVolume(parseFloat(e.target.value) || 1.0)}
                   className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Original Gravity</label>
                <input
                   type="number"
                   step="0.001"
                   min="1.000"
                   max="1.200"
                   value={newOg}
                   onChange={(e) => setNewOg(parseFloat(e.target.value) || 1.090)}
                   className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Target Final</label>
                <input
                   type="number"
                   step="0.001"
                   min="0.990"
                   max="1.100"
                   value={newTargetFg}
                   onChange={(e) => setNewTargetFg(parseFloat(e.target.value) || 1.000)}
                   className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Pitch Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] font-sans"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Cellar Notes & Ingredient list</label>
              <textarea
                placeholder="List exact fruit pounds, spices, nutrient strategies, sanitization parameters..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs text-[#2D2A26] h-20 resize-none focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#E5E1DA]">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 border border-[#E5E1DA] text-[#78716C] rounded-sm text-xs font-bold uppercase tracking-wider bg-white"
              type="button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D97706] text-white rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-[#c26a05]"
            >
              Register Batch Profile
            </button>
          </div>
        </form>
      )}

      {/* 3. BATCH DETAIL MODE */}
      {selectedLog && (
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1DA] pb-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedLogId(null)}
                className="py-1.5 px-3 border border-[#E5E1DA] rounded-sm text-[#78716C] hover:text-[#1C1917] hover:bg-[#F5F5F4] text-xs font-bold uppercase tracking-widest bg-white transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cellar
              </button>
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#A8A29E] block mb-1">{selectedLog.style} Batch</span>
                <h2 className="text-3xl font-serif text-[#1C1917] leading-tight truncate max-w-sm sm:max-w-md md:max-w-xl">{selectedLog.batchName}</h2>
              </div>
            </div>

            {/* Quick Status Adjust & Delete buttons */}
            <div className="flex items-center gap-2">
              <select
                value={selectedLog.status}
                onChange={(e) => handleStatusChange(e.target.value as BrewLog["status"])}
                className="px-3 py-1.5 bg-[#1C1917] text-white border border-[#1C1917] text-xs font-bold uppercase tracking-widest rounded-none focus:outline-hidden cursor-pointer"
                id="select-detail-status"
              >
                <option value="Fermenting">Fermenting</option>
                <option value="Racked/Aging">Racked/Aging</option>
                <option value="Bottled">Bottled</option>
                <option value="Completed">Completed</option>
                <option value="Stalled">Stalled</option>
              </select>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this mead log batch?")) {
                    onDeleteLog(selectedLog.id);
                    setSelectedLogId(null);
                  }
                }}
                className="p-2 border border-[#E5E1DA] hover:bg-red-50 hover:border-red-200 text-red-600 rounded-none transition bg-white shadow-xs"
                title="Delete Brew Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Stats Bar in Grid Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 border border-[#E5E1DA] divide-x divide-y md:divide-y-0 divide-[#E5E1DA] text-center bg-white rounded-none overflow-hidden font-sans">
            <div className="p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Live ABV</span>
              <span className="text-2xl font-mono text-[#D97706] font-light">{getLiveABV(selectedLog)}%</span>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Original SG</span>
              <span className="text-xl font-mono text-[#1C1917] font-semibold">{selectedLog.originalGravity.toFixed(3)}</span>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Latest SG</span>
              <span className="text-xl font-mono text-amber-900 font-semibold">{getLatestGravity(selectedLog).toFixed(3)}</span>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Target FG</span>
              <span className="text-xl font-mono text-[#1C1917] font-semibold">{selectedLog.finalGravity.toFixed(3)}</span>
            </div>
            <div className="p-4 flex flex-col justify-center items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Batch Vol</span>
              <span className="text-xl font-mono text-[#1C1917] font-semibold">{selectedLog.batchSize} gal</span>
            </div>
            <div className="p-4 flex flex-col justify-center items-center bg-[#F5F5F4]/30">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8A29E] mb-1.5">Yeast Strain</span>
              <span className="text-xs font-mono font-bold text-[#D97706] truncate max-w-full px-1" title={selectedLog.yeastName}>
                {selectedLog.yeastName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Box: Fermentation Progress Graph & Log readings */}
            <div className="space-y-6">
              <div className="border border-[#E5E1DA] rounded-none p-6 bg-white flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C1917] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#D97706]" />
                    Fermentation Curve
                  </h4>
                  <span className="text-[10px] uppercase font-mono text-[#78716C] font-bold bg-[#F5F5F4] border border-[#E5E1DA] px-2.5 py-0.5 rounded-none">
                    Target FG {selectedLog.finalGravity.toFixed(3)}
                  </span>
                </div>

                {/* Relational Chart from recharts */}
                <div className="h-44 w-full" id="chart-container">
                  {selectedLog.gravityReadings.length >= 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={selectedLog.gravityReadings.map((g, idx) => ({
                          index: idx + 1,
                          date: g.date,
                          gravity: g.correctedGravity
                        }))}
                        margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="2 2" stroke="#E5E1DA" />
                        <XAxis
                          dataKey="date"
                          stroke="#A8A29E"
                          fontSize={9}
                          tickLine={false}
                        />
                        <YAxis
                          domain={["auto", "auto"]}
                          stroke="#A8A29E"
                          fontSize={9}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{ background: "#fff", borderColor: "#E5E1DA", borderRadius: "0px", fontSize: "11px" }}
                          labelStyle={{ fontWeight: "700", color: "#1C1917" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="gravity"
                          stroke="#D97706"
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 1.5, fill: "#fff", stroke: "#D97706" }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      Log gravity coordinates to compile fermentation graph
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[9px] font-bold font-mono tracking-wider text-[#A8A29E] mt-4 border-t border-[#F5F5F4] pt-3">
                  <span>Start OG: {selectedLog.originalGravity.toFixed(3)}</span>
                  <span>Target FG: {selectedLog.finalGravity.toFixed(3)}</span>
                </div>
              </div>

              {/* Form to Log New Gravity */}
              <div>
                {!showGravForm ? (
                  <button
                    onClick={() => setShowGravForm(true)}
                    className="w-full py-3 border border-dashed border-[#D97706] bg-[#FDFCFB] hover:bg-[#F5F5F4]/35 text-[#D97706] rounded-none text-xs font-bold tracking-widest uppercase transition flex items-center justify-center gap-1.5"
                    id="btn-show-gravity-form"
                  >
                    <Plus className="w-4 h-4" />
                    Record Gravity / Hydrometer Entry
                  </button>
                ) : (
                  <form onSubmit={handleAddGravityReading} className="bg-white border-2 border-[#D97706] rounded-none p-6 space-y-4 shadow-xs">
                    <h5 className="text-xs font-bold text-[#1C1917] tracking-widest uppercase mb-2">Log Real-Time Specific Gravity</h5>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Measured Gravity</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.980"
                          max="1.200"
                          required
                          value={logGravity}
                          onChange={(e) => setLogGravity(parseFloat(e.target.value) || 1.0)}
                          className="w-full px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono focus:outline-hidden focus:border-[#D97706]"
                          id="gravity-form-val"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Temp Correction</label>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            type="checkbox"
                            checked={applyTempCorrection}
                            onChange={(e) => setApplyTempCorrection(e.target.checked)}
                            className="w-4 h-4 rounded-none border-[#E5E1DA] text-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                            id="apply-temp-correction-check"
                          />
                          <span className="text-xs text-[#78716C] font-semibold">Apply at Temp</span>
                        </div>
                      </div>
                    </div>

                    {applyTempCorrection && (
                      <div>
                        <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Measured Temperature (°F)</label>
                        <input
                          type="number"
                          value={logTemp}
                          onChange={(e) => setLogTemp(parseInt(e.target.value) || 70)}
                          className="w-full px-3 py-2 bg-gray-50 border border-[#E5E1DA] rounded-sm text-xs font-mono focus:outline-hidden"
                          id="gravity-form-temp"
                        />
                        <span className="text-[10px] text-[#A8A29E] block mt-1">Converts density automatically (Calibration Calibrated at 60°F).</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Measurement notes & Actions</label>
                      <input
                        type="text"
                        placeholder="e.g. Degassed must and added 3rd Fermaid O dose"
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E5E1DA] rounded-sm text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="flex justify-end gap-2 text-xs font-bold uppercase tracking-wider">
                      <button
                        onClick={() => setShowGravForm(false)}
                        className="px-4 py-1.5 border border-[#E5E1DA] text-[#78716C] rounded-none bg-white font-sans"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#D97706] hover:bg-[#c26a05] text-white rounded-none"
                        id="btn-submit-gravity"
                      >
                        Save Reading
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Box: Timeline Events & Custom logs */}
            <div className="space-y-6">
              <div className="border border-[#E5E1DA] rounded-none p-6 bg-white flex flex-col">
                <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-3 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#1C1917] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D97706]" />
                    Historic Timeline
                  </h4>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#D97706] hover:text-[#c26a05] border-b border-transparent hover:border-[#D97706] transition-all"
                    id="btn-show-event-form"
                  >
                    Add Custom Event
                  </button>
                </div>

                {showEventForm && (
                  <form onSubmit={handleAddTimelineEvent} className="bg-[#F5F5F4] p-5 border border-[#E5E1DA] rounded-none space-y-3 mb-4" id="event-log-form">
                    <h5 className="text-[10px] font-bold tracking-wider uppercase text-[#A8A29E] mb-2">Log Manual Batch Action</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold text-[#A8A29E] mb-1">Type</label>
                        <select
                          value={newEventType}
                          onChange={(e) => setNewEventType(e.target.value as any)}
                          className="w-full px-2 py-1 bg-white border border-[#E5E1DA] rounded-sm text-xs"
                        >
                          <option value="addition">Addition (Ingredients)</option>
                          <option value="rack">Racking (Secondary)</option>
                          <option value="bottle">Bottling</option>
                          <option value="taste">Tasting Note</option>
                          <option value="other">Other Action</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider font-bold text-[#A8A29E] mb-1">Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Added 2oz medium toast oak cubes"
                          value={newEventDesc}
                          onChange={(e) => setNewEventDesc(e.target.value)}
                          className="w-full px-2.5 py-1 bg-white border border-[#E5E1DA] rounded-sm text-xs"
                          id="event-form-desc"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-[9px] font-bold uppercase tracking-widest pt-2">
                      <button
                        onClick={() => setShowEventForm(false)}
                        className="px-2 py-1 border border-[#E5E1DA] text-[#78716C]"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 bg-[#1C1917] text-white hover:bg-[#2D2A26]"
                        id="btn-submit-event"
                      >
                        Post Event
                      </button>
                    </div>
                  </form>
                )}

                {/* List of events */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {selectedLog.timelineEvents.map((ev) => (
                    <div key={ev.id} className="flex gap-2.5 text-xs text-gray-600 font-sans p-2 rounded-none hover:bg-gray-50 transition-colors border-b border-[#F5F5F4] pb-2 last:border-b-0">
                      <span className="flex-shrink-0 text-[10px] font-bold text-gray-500 bg-[#F5F5F4] h-5 px-2 rounded-none flex items-center justify-center font-mono border border-[#E5E1DA]">
                        {ev.date}
                      </span>
                      <div className="leading-normal text-[#2D2A26]">
                        <span className="font-bold text-[#1C1917] uppercase tracking-wider text-[10px] block mb-0.5">
                          {ev.type === "addition" ? "Ingredients Addition 🍇" : ev.type === "rack" ? "Racked must 🍷" : ev.type === "bottle" ? "Bottled 🍾" : ev.type === "gravity" ? "Gravity Check 🧪" : ev.type === "taste" ? "Tasting Evaluation 👅" : "Cellar Log 📝"}
                        </span>{" "}
                        {ev.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Must profile specs */}
              <div className="bg-[#1C1917] p-6 text-white rounded-none border border-[#1C1917] flex gap-3 text-xs leading-normal">
                <Compass className="w-5 h-5 text-[#D97706] flex-shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A8A29E] block mb-2">Cellar Ingredients & Formulation Specs</span>
                  <div className="text-white/80 font-medium whitespace-pre-wrap font-sans">{selectedLog.notes || "No extra notes logged."}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

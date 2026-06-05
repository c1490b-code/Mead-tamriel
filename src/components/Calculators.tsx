import React, { useState, useEffect } from "react";
import { Info, HelpCircle, Layers, Thermometer, FlaskConical, Scale } from "lucide-react";

export function Calculators() {
  const [activeTab, setActiveTab] = useState<"abv" | "og" | "temp" | "tosna">("abv");

  // ABV fields
  const [og, setOg] = useState<number>(1.090);
  const [fg, setFg] = useState<number>(1.002);
  const [abvBasic, setAbvBasic] = useState<number>(0);
  const [abvAdvanced, setAbvAdvanced] = useState<number>(0);
  const [attenuation, setAttenuation] = useState<number>(0);

  // OG calculation fields
  const [honeyWeight, setHoneyWeight] = useState<number>(3.0);
  const [otherSugars, setOtherSugars] = useState<number>(0);
  const [batchVolume, setBatchVolume] = useState<number>(1.0);
  const [volUnit, setVolUnit] = useState<"gal" | "L">("gal");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [estimatedOG, setEstimatedOG] = useState<number>(1.0);

  // Temperature Correction fields
  const [measuredSg, setMeasuredSg] = useState<number>(1.090);
  const [measuredTemp, setMeasuredTemp] = useState<number>(85);
  const [calibTemp, setCalibTemp] = useState<number>(60);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [correctedSg, setCorrectedSg] = useState<number>(1.0);

  // TOSNA nutrient fields
  const [tosnaOg, setTosnaOg] = useState<number>(1.090);
  const [tosnaVol, setTosnaVol] = useState<number>(1.0);
  const [tosnaVolUnit, setTosnaVolUnit] = useState<"gal" | "L">("gal");
  const [yeastDemand, setYeastDemand] = useState<"Low" | "Medium" | "High">("Medium");
  const [totalNutrient, setTotalNutrient] = useState<number>(0);

  // 1. Calculate ABV whenever OG or FG change
  useEffect(() => {
    if (og >= fg) {
      const basic = (og - fg) * 131.25;
      // Advanced formula: (76.08 * (OG - FG) / (2.0665 - OG)) * (100 / FG)
      const advanced = (76.08 * (og - fg) / (2.0665 - og)) * (100 / fg);
      const appAtt = og > 1.0 ? ((og - fg) / (og - 1.0)) * 100 : 0;

      setAbvBasic(Number(basic.toFixed(2)));
      setAbvAdvanced(Number(advanced.toFixed(2)));
      setAttenuation(Number(appAtt.toFixed(1)));
    } else {
      setAbvBasic(0);
      setAbvAdvanced(0);
      setAttenuation(0);
    }
  }, [og, fg]);

  // 2. Estimate MUST Gravity based on honey / volume
  useEffect(() => {
    // Honey adds ~35 gravity points per lb per gallon (specifically 1.035 for 1lb of honey in 1gal must)
    // 1 kg is 2.20462 lbs. 1 gallon is 3.78541 liters.
    let hLbs = honeyWeight;
    if (weightUnit === "kg") {
      hLbs = honeyWeight * 2.20462;
    }

    let sLbs = otherSugars;
    if (weightUnit === "kg") {
      sLbs = otherSugars * 2.20462;
    }

    let vGal = batchVolume;
    if (volUnit === "L") {
      vGal = batchVolume / 3.78541;
    }

    if (vGal > 0) {
      // Honey adds ~35 gravity points per lb/gal
      // Other sugars (sucrose) adds ~46 gravity points per lb/gal
      const honeyPoints = hLbs * 35.0;
      const sugarPoints = sLbs * 46.0;
      const totalPoints = (honeyPoints + sugarPoints) / vGal;
      
      const calcOg = 1.0 + (totalPoints / 1000);
      setEstimatedOG(Number(calcOg.toFixed(3)));
    } else {
      setEstimatedOG(1.000);
    }
  }, [honeyWeight, otherSugars, batchVolume, volUnit, weightUnit]);

  // 3. Hydrometer Temperature Correction
  useEffect(() => {
    // Formula works with Fahrenheit
    let tempF = measuredTemp;
    let calF = calibTemp;

    if (tempUnit === "C") {
      tempF = (measuredTemp * 9) / 5 + 32;
      calF = (calibTemp * 9) / 5 + 32;
    }

    // Standard correction polynomial relative to 59F calibration
    // Correction = 1.313454e-3 - (1.326743e-4 * T) + (2.057793e-6 * T^2) - (2.627634e-9 * T^3)
    const factorAtT =
      1.313454e-3 -
      1.326743e-4 * tempF +
      2.057793e-6 * Math.pow(tempF, 2) -
      2.627634e-9 * Math.pow(tempF, 3);

    const factorAtCal =
      1.313454e-3 -
      1.326743e-4 * calF +
      2.057793e-6 * Math.pow(calF, 2) -
      2.627634e-9 * Math.pow(calF, 3);

    const adjustment = factorAtT - factorAtCal;
    const finalSg = measuredSg + adjustment;

    setCorrectedSg(Number(finalSg.toFixed(4)));
  }, [measuredSg, measuredTemp, calibTemp, tempUnit]);

  // 4. TOSNA 2.0 (Fermaid O) calculation
  useEffect(() => {
    // Volume in gallons
    let vGal = tosnaVol;
    if (tosnaVolUnit === "L") {
      vGal = tosnaVol / 3.78541;
    }

    // Yeast factor multiplier: Low=0.75, Medium=1.0, High=1.25
    let demandMultiplier = 1.0;
    if (yeastDemand === "Low") demandMultiplier = 0.75;
    if (yeastDemand === "High") demandMultiplier = 1.25;

    // TOSNA 2.0: grams = (OG - 1.000) * 1000 * volume * 0.00315 * multiplier
    const gravityPoints = (tosnaOg - 1.000) * 1000;
    
    if (gravityPoints > 0 && vGal > 0) {
      const gNutrient = gravityPoints * vGal * 0.00315 * demandMultiplier;
      setTotalNutrient(Number(gNutrient.toFixed(2)));
    } else {
      setTotalNutrient(0);
    }
  }, [tosnaOg, tosnaVol, tosnaVolUnit, yeastDemand]);

  return (
    <div className="bg-white rounded-none border border-[#E5E1DA] shadow-xs overflow-hidden" id="mead-calculators">
      {/* Tab Selectors */}
      <div className="flex border-b border-[#E5E1DA] bg-white text-[10px] sm:text-xs font-bold uppercase tracking-widest overflow-x-auto">
        <button
          onClick={() => setActiveTab("abv")}
          className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "abv"
              ? "border-[#D97706] text-[#D97706] bg-[#FDFCFB]"
              : "border-transparent text-[#78716C] hover:text-[#D97706]"
          }`}
          id="btn-calc-tab-abv"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          ABV & Attenuation
        </button>
        <button
          onClick={() => setActiveTab("og")}
          className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "og"
              ? "border-[#D97706] text-[#D97706] bg-[#FDFCFB]"
              : "border-transparent text-[#78716C] hover:text-[#D97706]"
          }`}
          id="btn-calc-tab-og"
        >
          <Scale className="w-3.5 h-3.5" />
          Density Estimator
        </button>
        <button
          onClick={() => setActiveTab("temp")}
          className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "temp"
              ? "border-[#D97706] text-[#D97706] bg-[#FDFCFB]"
              : "border-transparent text-[#78716C] hover:text-[#D97706]"
          }`}
          id="btn-calc-tab-temp"
        >
          <Thermometer className="w-3.5 h-3.5" />
          Temp Correction
        </button>
        <button
          onClick={() => setActiveTab("tosna")}
          className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all whitespace-nowrap ${
            activeTab === "tosna"
              ? "border-[#D97706] text-[#D97706] bg-[#FDFCFB]"
              : "border-transparent text-[#78716C] hover:text-[#D97706]"
          }`}
          id="btn-calc-tab-tosna"
        >
          <Layers className="w-3.5 h-3.5" />
          Nutrients (TOSNA 2.0)
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* TAB 1: ABV CALCULATOR */}
        {activeTab === "abv" && (
          <div className="space-y-6">
            <div>
              <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Mead Strength Engine</p>
              <h3 className="text-xl font-serif text-[#1C1917]" id="calc-abv-title">Alcohol by Volume (ABV)</h3>
              <p className="text-xs text-[#78716C] mt-1">Calculates the estimated alcohol strength of your mead by measuring density before and after fermentation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Original Gravity (OG)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="1.000"
                      max="1.250"
                      value={og}
                      onChange={(e) => setOg(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden focus:border-[#D97706]"
                      id="input-og"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xs font-mono text-gray-400">e.g., 1.090</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Final Gravity (FG)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0.980"
                      max="1.100"
                      value={fg}
                      onChange={(e) => setFg(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden focus:border-[#D97706]"
                      id="input-fg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xs font-mono text-gray-400">e.g., 1.000</div>
                  </div>
                </div>
              </div>

              {/* Outputs in striking high contrast dark card */}
              <div className="bg-[#1C1917] text-white p-6 flex flex-col justify-between rounded-none shadow-xs border border-[#1C1917]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">
                    <FlaskConical className="w-4 h-4 text-[#D97706]" />
                    Est. Alcohol Strengths
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-none">
                      <div className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">Advanced Formula</div>
                      <div className="text-2xl md:text-3xl font-bold font-mono text-[#D97706] mt-1">{abvAdvanced}%</div>
                    </div>
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-none">
                      <div className="text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">Basic Formula</div>
                      <div className="text-2xl md:text-3xl font-bold font-mono text-white/95 mt-1">{abvBasic}%</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider">Attenuation</div>
                    <div className="text-sm font-semibold font-mono text-white mt-0.5">{attenuation}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#A8A29E] font-bold uppercase tracking-wider">Density Drop</div>
                    <div className="text-sm font-semibold font-mono text-white mt-0.5">{(og - fg).toFixed(3)} pts</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FDFCFB] rounded-none p-4 flex gap-3 text-xs text-[#78716C] border border-[#E5E1DA]">
              <Info className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1C1917] block mb-0.5 uppercase tracking-wide text-[10px]">Formula Calculations Explained</span>
                The basic formula `(OG - FG) * 131.25` is simple but loses accuracy above 6% ABV because alcohol is lighter than water. The advanced logarithmic formula provides far greater accuracy for deep, strong craft meads up to 18-20% ABV.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OG MUST ESTIMATOR */}
        {activeTab === "og" && (
          <div className="space-y-6">
            <div>
              <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Gravity Staging Tool</p>
              <h3 className="text-xl font-serif text-[#1C1917]" id="calc-og-title">Must Density Estimator</h3>
              <p className="text-xs text-[#78716C] mt-1">Estimate the starting gravity (OG) of your mead must based on how much honey you mix in a given batch volume.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Weight Unit</label>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as "lbs" | "kg")}
                      className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-[#2D2A26] text-xs font-semibold focus:outline-hidden focus:border-[#D97706]"
                      id="select-weight-unit"
                    >
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Volume Unit</label>
                    <select
                      value={volUnit}
                      onChange={(e) => setVolUnit(e.target.value as "gal" | "L")}
                      className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-[#2D2A26] text-xs font-semibold focus:outline-hidden focus:border-[#D97706]"
                      id="select-vol-unit"
                    >
                      <option value="gal">Gallons (gal)</option>
                      <option value="L">Liters (L)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Honey Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={honeyWeight}
                      onChange={(e) => setHoneyWeight(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-honey-weight"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{weightUnit}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Other Sugars (Sucrose / Sugar)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={otherSugars}
                      onChange={(e) => setOtherSugars(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-other-sugars"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{weightUnit}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Total Batch Volume</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={batchVolume}
                      onChange={(e) => setBatchVolume(parseFloat(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-batch-volume"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{volUnit}</div>
                  </div>
                </div>
              </div>

              {/* Outputs in high contrast */}
              <div className="bg-[#1C1917] text-white p-6 flex flex-col justify-between rounded-none shadow-xs border border-[#1C1917]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">
                    <Scale className="w-4 h-4 text-[#D97706]" />
                    Estimated Gravity Result
                  </div>
                  <div className="text-center py-10 bg-white/5 border border-white/10 rounded-none mt-6">
                    <div className="text-[10px] text-[#A8A29E] font-bold tracking-widest uppercase mb-1">Estimated Original Gravity</div>
                    <div className="text-4xl md:text-5xl font-bold font-mono text-[#D97706] mt-2">{estimatedOG.toFixed(3)}</div>
                    <div className="text-xs text-white/50 mt-3 font-semibold font-sans">Potential Strength: ~{((estimatedOG - 1.0) * 131.25).toFixed(1)}% ABV</div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-[10px] text-[#A8A29E] font-bold uppercase tracking-wider">
                  <div>Honey: {honeyWeight} {weightUnit}</div>
                  <div>Vol: {batchVolume} {volUnit}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HYDROMETER TEMP CORRECTION */}
        {activeTab === "temp" && (
          <div className="space-y-6">
            <div>
              <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Density Verification</p>
              <h3 className="text-xl font-serif text-[#1C1917]" id="calc-temp-title">Hydrometer Temperature Correction</h3>
              <p className="text-xs text-[#78716C] mt-1">Hydrometers are calibrated at a specific temperature. Correct measured density readings if your must is warm.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Measured Gravity</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.980"
                      max="1.200"
                      value={measuredSg}
                      onChange={(e) => setMeasuredSg(parseFloat(e.target.value) || 1.0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-measured-sg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Temp Unit</label>
                    <select
                      value={tempUnit}
                      onChange={(e) => setTempUnit(e.target.value as "F" | "C")}
                      className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-[#2D2A26] font-semibold text-xs focus:outline-hidden"
                      id="select-temp-unit"
                    >
                      <option value="F">Fahrenheit (°F)</option>
                      <option value="C">Celsius (°C)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Liquid Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="32"
                      value={measuredTemp}
                      onChange={(e) => setMeasuredTemp(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-measured-temp"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">°{tempUnit}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Hydrometer Calibration Temperature</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={calibTemp}
                      onChange={(e) => setCalibTemp(parseInt(e.target.value) || 60)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-calib-temp"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">°{tempUnit} (Standard: 60°F)</div>
                  </div>
                </div>
              </div>

              {/* Outputs */}
              <div className="bg-[#1C1917] text-white p-6 flex flex-col justify-between rounded-none shadow-xs border border-[#1C1917]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">
                    <Thermometer className="w-4 h-4 text-[#D97706]" />
                    Corrected Density
                  </div>
                  <div className="text-center py-10 bg-white/5 border border-white/10 rounded-none mt-6">
                    <div className="text-[10px] text-[#A8A29E] font-bold tracking-widest uppercase mb-1">True SG (Standardized)</div>
                    <div className="text-4xl md:text-5xl font-bold font-mono text-[#D97706] mt-2">{correctedSg.toFixed(4)}</div>
                    <div className="text-xs text-white/50 mt-3 font-semibold font-sans">
                      Difference: {correctedSg >= measuredSg ? "+" : ""}{(correctedSg - measuredSg).toFixed(4)} points
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-6 text-2xs text-[#A8A29E] font-medium font-sans leading-relaxed">
                  Hot liquids are less dense, which floats the hydrometer lower, reading artificially dry. Adding correction points guarantees your logs are flawless.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TOSNA 2.0 CALCULATOR */}
        {activeTab === "tosna" && (
          <div className="space-y-6">
            <div>
              <p className="text-[#D97706] font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Organic Yeast Staging Rules (YAN)</p>
              <h3 className="text-xl font-serif text-[#1C1917]" id="calc-tosna-title">TOSNA 2.0 Nutrient Schedule</h3>
              <p className="text-xs text-[#78716C] mt-1">Staggered Nutrient Additions utilizing organic **Fermaid O** prevent yeast stalls and volatile sulfur off-flavors in mead.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Original Gravity</label>
                    <input
                      type="number"
                      step="0.001"
                      min="1.000"
                      max="1.200"
                      value={tosnaOg}
                      onChange={(e) => setTosnaOg(parseFloat(e.target.value) || 1.0)}
                      className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                      id="input-tosna-og"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Volume Unit</label>
                    <select
                      value={tosnaVolUnit}
                      onChange={(e) => setTosnaVolUnit(e.target.value as "gal" | "L")}
                      className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-[#2D2A26] text-xs font-semibold focus:outline-hidden"
                      id="select-tosna-vol-unit"
                    >
                      <option value="gal">Gallons (gal)</option>
                      <option value="L">Liters (L)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Batch Volume</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={tosnaVol}
                    onChange={(e) => setTosnaVol(parseFloat(e.target.value) || 1.0)}
                    className="w-full mt-1 px-4 py-2.5 bg-white border border-[#E5E1DA] rounded-sm text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                    id="input-tosna-vol"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider leading-6">Yeast Nitrogen Demand</label>
                  <select
                    value={yeastDemand}
                    onChange={(e) => setYeastDemand(e.target.value as "Low" | "Medium" | "High")}
                    className="w-full mt-1 px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-[#2D2A26] font-semibold text-xs focus:outline-hidden"
                    id="select-yeast-demand"
                  >
                    <option value="Low">Low Demand (e.g. EC-1118, K1-V1116)</option>
                    <option value="Medium">Medium Demand (e.g. D47, 71B, US-05)</option>
                    <option value="High">High Demand (e.g. M05 Mead Yeast)</option>
                  </select>
                </div>
              </div>

              {/* TOSNA Timeline */}
              <div className="bg-[#1C1917] p-6 text-white rounded-none border border-[#1C1917]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">
                    <Layers className="w-4 h-4 text-[#D97706]" />
                    Fermaid O Weight Schedule
                  </div>
                  <div className="bg-white/10 text-[#D97706] font-mono text-xs font-semibold px-2.5 py-1 rounded-none border border-white/10 uppercase tracking-widest">
                    {totalNutrient} g Total
                  </div>
                </div>

                {totalNutrient > 0 ? (
                  <div className="mt-6 space-y-4 pr-1">
                    <div className="relative pl-6 border-l border-white/10 space-y-4">
                      {/* Event 24h */}
                      <div className="relative">
                        <div className="absolute -left-[29px] top-1.5 bg-[#D97706] rounded-none w-3 h-3 flex items-center justify-center"></div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">24 Hours (Addition 1)</div>
                        <p className="text-sm text-white/90 font-mono mt-0.5">Add <span className="text-[#D97706] font-bold">{(totalNutrient / 4).toFixed(2)}g</span> Fermaid O</p>
                      </div>

                      {/* Event 48h */}
                      <div className="relative">
                        <div className="absolute -left-[29px] top-1.5 bg-white/40 rounded-none w-3 h-3 flex items-center justify-center"></div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">48 Hours (Addition 2)</div>
                        <p className="text-sm text-white/90 font-mono mt-0.5">Add <span className="text-[#D97706] font-bold">{(totalNutrient / 4).toFixed(2)}g</span> Fermaid O</p>
                      </div>

                      {/* Event 72h */}
                      <div className="relative">
                        <div className="absolute -left-[29px] top-1.5 bg-white/40 rounded-none w-3 h-3 flex items-center justify-center"></div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">72 Hours (Addition 3)</div>
                        <p className="text-sm text-white/90 font-mono mt-0.5">Add <span className="text-[#D97706] font-bold">{(totalNutrient / 4).toFixed(2)}g</span> Fermaid O</p>
                      </div>

                      {/* Event 1/3 sugar break */}
                      <div className="relative">
                        <div className="absolute -left-[29px] top-1.5 bg-[#D97706] rounded-none w-3 h-3 flex items-center justify-center"></div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">1/3 Sugar Break (Addition 4)</div>
                        <p className="text-sm text-white/95 font-mono mt-0.5">
                          Add <span className="text-[#D97706] font-bold">{(totalNutrient / 4).toFixed(2)}g</span> at target gravity:{" "}
                          <span className="font-bold text-[#D97706]">
                            {(1.0 + ((tosnaOg - 1.0) * 2) / 3).toFixed(3)}
                          </span>{" "}
                          (or @ 96hr)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-white/40">
                    Input a gravity &gt; 1.000 to compute nutrients timeline
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { AiRecipe, BrewLog } from "../types";
import { Sparkles, Loader2, Save, Wand2, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";

interface RecipeGenProps {
  onSaveToLogs: (newLog: BrewLog) => void;
}

const HONEY_TYPES = [
  "Orange Blossom (citrusy, delicate, bright)",
  "Clover (classic, light floral, crisp)",
  "Wildflower (complex, robust, herbal notes)",
  "Tupelo (rare, light buttery, herbal sweetness)",
  "Meadowfoam (vanilla, marshmallow, caramelized spun sugar)",
  "Buckwheat (dark, earth, molasses, rich & bold)",
  "Raspberry Blossom (fruity, soft floral undertones)",
  "Sourwood (spicy, anise, rich caramel profile)",
  "Avocado Honey (molasses-like, buttery, dark fruit notes)"
];

const MEAD_STYLES = [
  { value: "Traditional", label: "Traditional Mead", desc: "Just honey, water, yeast, and nutrients. Raw, pure varietal honey profile." },
  { value: "Melomel", label: "Melomel (Fruit)", desc: "Fermented with actual fruits (berries, cherries, stone fruits)." },
  { value: "Metheglin", label: "Metheglin (Spiced/Herbal)", desc: "Infused with spices, tea, or dried botanicals (cinnamon, vanilla, hibiscus)." },
  { value: "Cyser", label: "Cyser (Apple Cider)", desc: "Honey fermented directly in apple cider or apple must instead of water." },
  { value: "Pyment", label: "Pyment (Grape)", desc: "Honey fermented in fresh grape juice (hybrid of wine and mead)." },
  { value: "Acerglyn", label: "Acerglyn (Maple Syrup)", desc: "Honey and pure maple syrup dual-fermentation." }
];

export function RecipeGen({ onSaveToLogs }: RecipeGenProps) {
  const [style, setStyle] = useState("Traditional");
  const [sweetness, setSweetness] = useState("Semi-Sweet");
  const [honeyType, setHoneyType] = useState("Orange Blossom (citrusy, delicate, bright)");
  const [targetABV, setTargetABV] = useState<number>(12);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [additions, setAdditions] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<AiRecipe | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setRecipe(null);
    setSavedSuccess(false);

    try {
      const response = await fetch("/api/mead/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          style,
          sweetness,
          honeyType,
          targetABV,
          batchSize,
          additionalIngredients: additions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipe");
      }

      setRecipe(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during recipe generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLogs = () => {
    if (!recipe) return;

    // Convert estimated recipe to a functional Brew Log model
    const newLog: BrewLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      batchName: recipe.recipeName,
      style: recipe.style,
      honeyType: honeyType.split(" (")[0],
      yeastName: recipe.yeastRecommendation.name,
      batchSize: batchSize,
      batchSizeUnit: "gal",
      originalGravity: recipe.estimatedOG,
      finalGravity: recipe.estimatedFG,
      dateStarted: new Date().toISOString().split("T")[0],
      status: "Fermenting",
      notes: `AI Generated Recipe flavor notes: ${recipe.flavorProfile.tastingNotes}. YAN Level: ${recipe.nutrientSchedule}`,
      gravityReadings: [
        {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString().split("T")[0],
          gravity: recipe.estimatedOG,
          correctedGravity: recipe.estimatedOG,
          notes: "Initial Must Original Gravity (OG) Pitched"
        }
      ],
      timelineEvents: [
        {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString().split("T")[0],
          type: "addition",
          description: `Must mixed and pitched yeast: ${recipe.yeastRecommendation.name}`
        }
      ]
    };

    onSaveToLogs(newLog);
    setSavedSuccess(true);
  };

  return (
    <div className="bg-white rounded-none border border-[#E5E1DA] shadow-xs overflow-hidden" id="ai-recipe-generator">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Setup Inputs */}
        <div className="p-6 md:p-8 lg:col-span-5 border-r border-[#E5E1DA]">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[#1C1917] font-bold">
              <Sparkles className="w-5 h-5 text-[#D97706] animate-pulse" />
              <h2 className="text-xl font-serif tracking-tight">AI Mead Formulator</h2>
            </div>
            <p className="text-xs text-[#78716C] mt-2">
              Harness the intelligence of server-side Gemini to draft master-grade artisan mead recipes with optimized honey weights, tailored instructions, and yeast suggestions.
            </p>
          </div>

          <div className="space-y-4">
            {/* Mead Style */}
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-2">Style of Mead</label>
              <div className="grid grid-cols-2 gap-2">
                {MEAD_STYLES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setStyle(st.value)}
                    className={`text-left p-3 rounded-none border text-xs leading-tight transition-all duration-150 ${
                      style === st.value
                        ? "border-[#1C1917] bg-[#1C1917] text-white"
                        : "border-[#E5E1DA] text-[#78716C] hover:bg-[#FDFCFB] hover:border-[#1C1917]/40"
                    }`}
                  >
                    <span className="font-bold block">{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Honey Type */}
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1.5">Honey Profile</label>
              <select
                value={honeyType}
                onChange={(e) => setHoneyType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E5E1DA] rounded-none text-xs text-[#2D2A26] font-semibold focus:outline-hidden focus:border-[#D97706]"
                id="select-honey-type"
              >
                {HONEY_TYPES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* Sweetness Selector */}
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1.5">Target Sweetness</label>
              <div className="grid grid-cols-4 gap-1.5 font-sans leading-none">
                {["Dry", "Semi-Dry", "Semi-Sweet", "Sweet"].map((sw) => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => setSweetness(sw)}
                    className={`py-2 text-center text-[10px] rounded-none font-bold uppercase tracking-wider transition-all border ${
                      sweetness === sw
                        ? "bg-[#D97706] text-white border-[#D97706]"
                        : "bg-white text-[#78716C] border-[#E5E1DA] hover:bg-[#FDFCFB]"
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Volume & ABV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Batch Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E1DA] rounded-none text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                  />
                  <span className="text-xs text-gray-400 font-bold">Gal</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Target ABV</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="4"
                    max="22"
                    step="0.5"
                    value={targetABV}
                    onChange={(e) => setTargetABV(parseFloat(e.target.value) || 12)}
                    className="w-full px-3 py-1.5 bg-white border border-[#E5E1DA] rounded-none text-xs font-mono text-[#2D2A26] focus:outline-hidden"
                  />
                  <span className="text-xs text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Custom additions */}
            <div>
              <label className="block text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider mb-1">Adjunct Additions (Optional)</label>
              <textarea
                placeholder="e.g. fresh raspberries, cinnamon, dried lavender, vanilla bean..."
                value={additions}
                onChange={(e) => setAdditions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E1DA] rounded-none text-xs text-[#2D2A26] focus:outline-hidden focus:border-[#D97706] h-16 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-2 bg-[#D97706] hover:bg-[#C26B05] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-none shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              id="generate-recipe-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Mazer formulating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-white" />
                  Synthesize Formulations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: AI Output Results */}
        <div className="lg:col-span-7 p-6 md:p-8 bg-[#FDFCFB] flex flex-col justify-between min-h-[450px] border-l border-[#E5E1DA]">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-[#D97706]" />
              <h4 className="text-sm font-serif font-bold text-[#1C1917] mt-4">Drafting Mead Formulation</h4>
              <p className="text-xs text-[#78716C] max-w-xs mt-2 leading-relaxed">
                Gemini is adjusting honey ratios, checking gravity tables, mapping staggered nourishment intervals, and selecting yeast profiles...
              </p>
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-red-200 rounded-none bg-red-50/40">
              <ShieldAlert className="w-10 h-10 text-red-600 mb-3" />
              <h4 className="text-sm font-bold text-red-950 uppercase tracking-wide">Recipe Generation Unsuccessful</h4>
              <p className="text-xs text-red-800 max-w-sm mt-1 mb-4">{error}</p>
              <div className="text-2xs text-[#78716C] bg-white border border-[#E5E1DA] px-3 py-1.5 rounded-none">
                Please assure your <strong>Settings / Secrets</strong> contains a verified <strong>GEMINI_API_KEY</strong>.
              </div>
            </div>
          )}

          {!loading && !error && !recipe && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#E5E1DA] rounded-none bg-white">
              <Sparkles className="w-8 h-8 text-amber-500/40 mb-3" />
              <h4 className="text-sm font-serif font-bold text-[#1C1917]">Brewing Room Idle</h4>
              <p className="text-xs text-[#78716C] max-w-xs mt-2">
                Configure your mead must volume, style preferences, and target gravity on the left, then trigger the AI Synthesizer!
              </p>
            </div>
          )}

          {recipe && (
            <div className="space-y-6 flex-1 overflow-y-auto max-h-[600px] pr-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E1DA] pb-4">
                <div>
                  <span className="text-2xs bg-[#1C1917] text-white font-bold px-2.5 py-0.5 rounded-none uppercase tracking-widest">
                    {recipe.style} • {recipe.difficulty}
                  </span>
                  <h3 className="text-xl md:text-2xl font-serif text-[#1C1917] mt-2">
                    {recipe.recipeName}
                  </h3>
                </div>

                {!savedSuccess ? (
                  <button
                    onClick={handleSaveToLogs}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-white font-bold rounded-none text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Track Batch in Journal
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[#D97706] bg-[#FEF3C7] border border-[#FDE68A] rounded-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tracked Successfully
                  </div>
                )}
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E1DA] rounded-none p-3.5 text-center shadow-2xs">
                  <div className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider font-sans">Target ABV</div>
                  <div className="text-base font-bold font-mono text-[#1C1917] mt-1">{recipe.targetABV}%</div>
                </div>
                <div className="bg-white border border-[#E5E1DA] rounded-none p-3.5 text-center shadow-2xs">
                  <div className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider font-sans">Starting SG</div>
                  <div className="text-base font-bold font-mono text-[#D97706] mt-1">{recipe.estimatedOG.toFixed(3)}</div>
                </div>
                <div className="bg-white border border-[#E5E1DA] rounded-none p-3.5 text-center shadow-2xs">
                  <div className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider font-sans">Final SG</div>
                  <div className="text-base font-bold font-mono text-[#D97706] mt-1">{recipe.estimatedFG.toFixed(3)}</div>
                </div>
                <div className="bg-white border border-[#E5E1DA] rounded-none p-3.5 text-center shadow-2xs">
                  <div className="text-[10px] text-[#A8A29E] uppercase font-bold tracking-wider font-sans">Sweetness</div>
                  <div className="text-xs font-bold text-[#1C1917] mt-1.5 bg-[#FDFCFB] py-0.5 rounded-none inline-block px-2 border border-[#E5E1DA]">{recipe.flavorProfile.sweetness}</div>
                </div>
              </div>

              {/* Yeast Section */}
              <div className="bg-white border border-[#E5E1DA] rounded-none p-4">
                <h4 className="text-[10px] font-bold text-[#A8A29E] tracking-widest uppercase mb-3 font-sans">Ideal Yeast Selection</h4>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[#FDFCFB] p-3.5 rounded-none border border-[#E5E1DA]">
                  <div>
                    <div className="text-sm font-bold text-[#1C1917] font-serif">{recipe.yeastRecommendation.name}</div>
                    <div className="text-xs text-[#78716C] leading-normal mt-1 font-sans">{recipe.yeastRecommendation.description}</div>
                  </div>
                  <div className="text-2xs text-[#78716C] bg-white border border-[#E5E1DA] p-3 rounded-none flex-shrink-0">
                    <div>Temp: <span className="font-bold text-[#1C1917] font-mono">{recipe.yeastRecommendation.tempRange}</span></div>
                    <div className="mt-1">Limit: <span className="font-bold text-[#1C1917] font-mono">{recipe.yeastRecommendation.alcoholTolerance}</span></div>
                  </div>
                </div>
              </div>

              {/* Expected Sensory Analysis */}
              <div className="bg-white border border-[#E5E1DA] rounded-none p-4">
                <h4 className="text-[10px] font-bold text-[#A8A29E] tracking-widest uppercase mb-3 font-sans">Expected Sensory Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                  <div>
                    <span className="font-bold text-[#121212] block uppercase tracking-wider text-[9px] text-[#A8A29E] mb-1 font-sans">Aroma Profile:</span>{" "}
                    <span className="text-[#2D2A26] font-medium">{recipe.flavorProfile.aroma}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#121212] block uppercase tracking-wider text-[9px] text-[#A8A29E] mb-1 font-sans">Tasting Notes:</span>{" "}
                    <span className="text-[#2D2A26] font-medium">{recipe.flavorProfile.tastingNotes}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div>
                <h4 className="text-[10px] font-bold text-[#A8A29E] tracking-widest uppercase mb-2.5 font-sans">Formulation Ingredients ({batchSize} Gallon batch)</h4>
                <div className="bg-white border border-[#E5E1DA] rounded-none overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FDFCFB] border-b border-[#E5E1DA] text-[#78716C] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2.5 text-[10px] font-sans">Ingredient</th>
                        <th className="px-4 py-2.5 text-[10px] font-sans">Quantity</th>
                        <th className="px-4 py-2.5 text-[10px] font-sans">Function</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E1DA] text-[#2D2A26]">
                      {recipe.ingredients.map((ing, i) => (
                        <tr key={i} className="hover:bg-[#FDFCFB]">
                          <td className="px-4 py-3 font-semibold text-[#1C1917] font-sans">{ing.item}</td>
                          <td className="px-4 py-3 font-mono font-bold text-[#D97706]">{ing.amount}</td>
                          <td className="px-4 py-3 text-xs text-[#78716C] font-sans">{ing.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step By Step */}
              <div>
                <h4 className="text-[10px] font-bold text-[#A8A29E] tracking-widest uppercase mb-2.5 font-sans">Step-by-Step formulation Instructions</h4>
                <div className="space-y-2.5">
                  {recipe.stepByStepInstructions.map((step, i) => (
                    <div key={i} className="flex gap-3 bg-white border border-[#E5E1DA] p-3.5 rounded-none hover:border-[#1C1917] transition-all">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#1C1917] text-white font-mono text-2xs font-bold rounded-none flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-[#2D2A26] font-sans">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staggered Nutrient Addition info */}
              <div className="bg-white border border-[#E5E1DA] rounded-none p-4">
                <h4 className="text-[10px] font-bold text-[#D97706] tracking-widest uppercase mb-1 font-sans">Tailored Yeast Nutrition Schedule</h4>
                <p className="text-xs text-[#78716C] leading-normal mt-2 bg-[#FDFCFB] p-3.5 rounded-none font-medium border border-[#E5E1DA] font-sans">{recipe.nutrientSchedule}</p>
              </div>

              {/* Brewing secrets */}
              <div>
                <h4 className="text-[10px] font-bold text-[#A8A29E] tracking-widest uppercase mb-2.5 font-sans">Mazer Secrets & Craft Tips</h4>
                <ul className="space-y-2.5 text-xs text-[#78716C] leading-relaxed pr-2 font-sans">
                  {recipe.brewingTips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#D97706] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

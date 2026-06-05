import { YeastProfile } from "../types";

export const YEAST_PROFILES: YeastProfile[] = [
  {
    name: "Lalvin D47",
    brand: "Lalvin",
    alcoholTolerance: 14,
    nitrogenRequirement: "Medium",
    tempRangeMinF: 59,
    tempRangeMaxF: 68,
    tempRangeMinC: 15,
    tempRangeMaxC: 20,
    description: "Highly popular for dry and sweet traditionals. Excellent at accentuating honey bouquet and producing complex mouthfeel. Prone to fusels if run too warm (above 68°F). Requires good nutrient tracking.",
    styles: ["Traditional Mead", "Show Mead", "Metheglin"]
  },
  {
    name: "Lalvin EC-1118",
    brand: "Lalvin",
    alcoholTolerance: 18,
    nitrogenRequirement: "Low",
    tempRangeMinF: 50,
    tempRangeMaxF: 86,
    tempRangeMinC: 10,
    tempRangeMaxC: 30,
    description: "A robust champaigne yeast. Extremely aggressive, wide temperature tolerance, and reliable finisher. Ideal for high ABV meads or restarting stuck fermentations. Tends to strip delicate honey aromatics due to heavy CO2 off-gassing, so back-sweeten or age well.",
    styles: ["High-gravity Meads", "Sparkling Mead", "Stuck Fermentations"]
  },
  {
    name: "Lalvin 71B",
    brand: "Lalvin",
    alcoholTolerance: 14,
    nitrogenRequirement: "Medium",
    tempRangeMinF: 59,
    tempRangeMaxF: 86,
    tempRangeMinC: 15,
    tempRangeMaxC: 30,
    description: "The absolute champion for Melomels (fruit meads). It breaks down up to 30-40% of malic acid in tart fruits (like cherries and berries), rounding out harsh acidity and introducing smooth, fruity esters.",
    styles: ["Melomel (Fruit Mead)", "Cyser (Apple Mead)", "Pyment"]
  },
  {
    name: "Lalvin K1-V1116",
    brand: "Lalvin",
    alcoholTolerance: 18,
    nitrogenRequirement: "Low",
    tempRangeMinF: 50,
    tempRangeMaxF: 95,
    tempRangeMinC: 10,
    tempRangeMaxC: 35,
    description: "Extremely robust, competitive factor, high heat tolerance. Brings out natural floral and tropical fruit esters from the must. Ideal for fruit meads, or difficult must conditions.",
    styles: ["Metheglin", "Melomel", "Session Mead"]
  },
  {
    name: "Mangrove Jack's M05",
    brand: "Mangrove Jack's",
    alcoholTolerance: 18,
    nitrogenRequirement: "High",
    tempRangeMinF: 59,
    tempRangeMaxF: 86,
    tempRangeMinC: 15,
    tempRangeMaxC: 30,
    description: "Specifically selected for mead production. Produces high esters and crisp, floral characters. High alcohol tolerance with excellent sugar attenuation. Requires high nitrogen additions to prevent yeast stress.",
    styles: ["Traditional Mead", "Sweet Melomel", "Pyment"]
  },
  {
    name: "Red Star Côte des Blancs",
    brand: "Red Star",
    alcoholTolerance: 14,
    nitrogenRequirement: "Medium",
    tempRangeMinF: 64,
    tempRangeMaxF: 80,
    tempRangeMinC: 18,
    tempRangeMaxC: 27,
    description: "Slow, steady fermenter. Enhances varietal honey fruitiness and spice notes. Excellent choice for cider-meads (cysers) and medium-sweet traditional meads where residual honey aroma is desired.",
    styles: ["Cyser", "Spiced Metheglin", "Sweet Traditional"]
  },
  {
    name: "SafAle US-05",
    brand: "Fermentis",
    alcoholTolerance: 12,
    nitrogenRequirement: "Medium",
    tempRangeMinF: 54,
    tempRangeMaxF: 77,
    tempRangeMinC: 12,
    tempRangeMaxC: 25,
    description: "Classic American clean ale yeast. Attenuates moderately, leaves a clean crisp profile. Terrific for light, crushable session meads (hydromels) of 4% to 8% ABV where you want simple, refreshing honey vibes.",
    styles: ["Session Hydromel", "Short Mead", "Dry Carbonated"]
  }
];

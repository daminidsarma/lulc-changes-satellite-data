# Analyzing LULC Changes in IIT Kanpur Over 10 Years (2015–2024)

End‑to‑end workflow (Google Earth Engine + Python) to map **Land Use/Land Cover (LULC)** for the **IIT Kanpur** campus and quantify **decadal changes**. The pipeline builds annual composites, classifies LULC, computes per‑class areas/percentages, and generates change matrices and maps.

> If you only want to use **Google Earth Engine (GEE)** you can complete the entire analysis in the Code Editor and export the final rasters/tables. Optional Python utilities are provided for plotting and report‑ready charts.

---

## ✨ Objectives

- Produce **annual LULC maps** for ~10 years (2015–2024) over IITK.
- Classes (numeric labels): **0 = forest**, **1 = open land**, **2 = buildings**, **3 = road**.
- Compute **area & % coverage** per class per year.
- Derive **change detection** (transition matrix and “from→to” maps).
- Export **GeoTIFFs** and **CSV summaries** for reuse in GIS/figures.

---

## 📁 Repository Structure (suggested)

```
lulc-changes-satellite-data/
├── gee/
│   ├── lulc_iitk_decade.js      # GEE script (paste your Code Editor script here)
│   └── aoi_iitk.geojson         # Campus AOI (polygon)
├── data/
│   ├── exports/rasters/         # GeoTIFF exports from GEE
│   └── exports/tables/          # CSV exports (areas, confusion matrices)
├── notebooks/
│   └── charts_and_maps.ipynb    # Optional Python plotting & map styling
├── src/
│   ├── plotting.py              # Helpers to plot % area bars, Sankey, etc.
│   └── postprocess.py           # Palette, legend, dissolve, vectorize utilities
├── figures/                     # Final PNG/SVG charts
├── requirements.txt
└── README.md
```

---

## 🛰️ Data & Time Span

- **Primary sources**  
  - **Sentinel‑2** (2016→present; use S2 SR, 10–20 m).  
  - **Landsat‑8/9** (2013→present; 30 m) for earlier years or gap‑filling.  
- **Time window**: 2015–2024 (adjust to your exact 10‑year range).  
- **AOI**: polygon around IIT Kanpur campus (add `gee/aoi_iitk.geojson`).

---

## 🧭 GEE Methodology (step‑by‑step)

1. **Import AOI** (Draw or upload GeoJSON/KML).  
2. **Choose sensor** per year: prefer **Sentinel‑2** (post‑2016). Fall back to **Landsat‑8** for 2015 (or create Landsat/S2 hybrid).  
3. **Cloud masking**:  
   - S2: use QA60 bits or S2_SR cloud probability (S2_CLOUD_PROBABILITY).  
   - Landsat: use pixel_qa (CFMask).  
4. **Seasonal/annual composites**: Median or percentile composites over a consistent **season** (e.g., post‑monsoon Oct–Dec). Keep the season fixed across years.  
5. **Indices & features** (stack with bands): NDVI, NDWI, NDBI, texture metrics if needed.  
6. **Training data**: Digitize polygons per class (**forest/open land/buildings/road**). Reuse across years or refine annually.  
7. **Classifier**: **Random Forest** (recommended). Save the trained classifier per year or retrain annually.  
8. **Post‑processing**: mode filter / majority filter, morphological open/close to reduce speckle.  
9. **Accuracy assessment**: hold‑out or stratified points; compute overall accuracy, kappa, per‑class metrics.  
10. **Area stats**: convert classified raster to per‑class area (ha) & percent; export as CSV.  
11. **Change detection**: cross‑tabulate Year_1 vs Year_2 (e.g., 2015→2024) to get a **transition matrix** and pixel‑wise “from→to” map.  
12. **Export**: GeoTIFF of each year, CSV of areas, and a single transition CSV.

---

## 🔧 Minimal GEE Snippet (template)

```js
// ==== Params ====
var aoi = /* your AOI geometry */;
var years = ee.List.sequence(2015, 2024);
var season = {start: '-10-01', end: '-12-31'}; // Oct–Dec

// Sentinel-2 SR collection
function s2(year) {
  var start = ee.Date.parse('YYYY-MM-dd', year + season.start);
  var end   = ee.Date.parse('YYYY-MM-dd', year + season.end);
  var col = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(aoi)
    .filterDate(start, end)
    .map(function(img){
      // Basic cloud mask using QA60
      var qa = img.select('QA60');
      var mask = qa.bitwiseAnd(1<<10).eq(0).and(qa.bitwiseAnd(1<<11).eq(0));
      return img.updateMask(mask);
    })
    .median()
    .clip(aoi);
  // Add indices
  var ndvi = col.normalizedDifference(['B8','B4']).rename('NDVI');
  var ndwi = col.normalizedDifference(['B3','B8']).rename('NDWI');
  var ndbi = col.normalizedDifference(['B11','B8']).rename('NDBI');
  return col.addBands([ndvi, ndwi, ndbi]);
}

// TODO: Add training FeatureCollection with 'class' property
var trainingFC = /* your polygons */;

// Train + classify for a single year
function classifyYear(y) {
  y = ee.Number(y);
  var img = s2(y);
  var inputBands = ['B2','B3','B4','B8','B11','B12','NDVI','NDWI','NDBI'];
  var samples = img.select(inputBands).sampleRegions({
    collection: trainingFC, properties: ['class'], scale: 10
  });
  var rf = ee.Classifier.smileRandomForest(200).train({
    features: samples, classProperty: 'class', inputProperties: inputBands
  });
  var cls = img.select(inputBands).classify(rf).rename('lulc').clip(aoi);
  return cls.set('year', y);
}

var classifiedList = years.map(classifyYear);
var classifiedCol = ee.ImageCollection.fromImages(classifiedList);

// Export example
var img2024 = ee.Image(classifiedCol.filter(ee.Filter.eq('year', 2024)).first());
Export.image.toDrive({
  image: img2024, description: 'IITK_LULC_2024', region: aoi, scale: 10, maxPixels: 1e13
});
```

> Add your **training polygons** with `class` values: 0=forest, 1=open land, 2=buildings, 3=road. For Landsat years, adapt band names and scale (=30 m).

---

## 📊 Outputs

- **GeoTIFFs**: `IITK_LULC_{year}.tif` (palette applied in QGIS/ArcGIS).  
- **Areas CSV**: `areas_{year}.csv` with hectares and percentage per class.  
- **Transition CSV**: `change_2015_2024.csv` (confusion/transition matrix).  
- **Styled maps** (optional): PNGs in `figures/` and an interactive HTML map via `folium`.

---

## ▶️ Optional: Local plotting (Python)

```txt
jupyter
numpy
pandas
matplotlib
geopandas
rasterio
folium
plotly
```
- Use `notebooks/charts_and_maps.ipynb` to create:  
  - Bar charts of % area by year,  
  - Sankey/alluvial of transitions,  
  - Interactive folium overlays of classified rasters.

---

## 🗺️ Color Palette (suggested)

| class id | label       | color (hex) |
|---------:|-------------|-------------|
| 0        | forest      | #2E8B57 |
| 1        | open land   | #F0E68C |
| 2        | buildings   | #B22222 |
| 3        | road        | #696969 |

---

## 🔁 GitHub — add/update files

Initial push:
```powershell
cd "C:\path\to\lulc-changes-satellite-data"
git init
git add .
git commit -m "Add GEE workflow for IITK LULC (2015–2024): script, AOI, README"
git branch -M main
git remote add origin https://github.com/daminidsarma/lulc-changes-satellite-data.git
git push -u origin main
```

If remote is wrong or you see a permission error:
```powershell
git remote -v
git remote remove origin
git remote add origin https://github.com/daminidsarma/lulc-changes-satellite-data.git
git push -u origin main
```

External drive “dubious ownership” fix (if needed):
```powershell
git config --global --add safe.directory "C:/path/to/lulc-changes-satellite-data"
```

---

## 📜 License & Citation

- Add a `LICENSE` (MIT recommended for permissive reuse).

> Sarma, D. (2025). *Analyzing LULC Changes in IIT Kanpur Over 10 Years (2015–2024)*. GitHub repository.

---

## ✅ Tips

- Keep the **season window** consistent across years.  
- Balance training samples across classes to avoid bias.  
- For mixed sensors (S2/L8), normalize features or train per‑sensor.  
- Always report **accuracy** alongside maps.  

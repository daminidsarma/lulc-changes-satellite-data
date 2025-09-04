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


---

## 🧭 GEE Methodology (step‑by‑step)

1. **Import AOI**
2. **Choose sensor** 
3. **Cloud masking**
4. **Seasonal/annual composites**
5. **Indices & features**  
6. **Training data**
7. **Classifier**: **Random Forest** 
8. **Post‑processing**
9. **Accuracy assessment**
10. **Area stats**
11. **Change detection** 
12. **Export**

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

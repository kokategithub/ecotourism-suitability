# 🌿 EcoTourism Suitability Prediction

An AI-powered web application that predicts eco-tourism suitability for any location in India using real-time satellite data from Google Earth Engine and a deep learning Attention U-Net model.

---

## 🚀 Features

- 🛰️ **Real-time satellite data** — Sentinel-2, ERA5 climate, SRTM elevation, SAR radar
- 🤖 **Attention U-Net** deep learning model for suitability classification
- 🗺️ **Interactive map** with segmentation overlay (Green / Yellow / Black zones)
- 📊 **Detailed explanation** — Favorable, Moderate, and Limiting factors
- 🔍 **Search by place name** or coordinates
- 3 suitability classes: **Suitable**, **Moderately Suitable**, **Not Suitable**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Map | Leaflet + React-Leaflet |
| Backend | Node.js + Express |
| Satellite Data | Google Earth Engine (GEE) |
| ML Model | Python + PyTorch (Attention U-Net) |

---

## 📋 Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.9+
- Google Earth Engine service account key (`.json`)

### Python dependencies
```bash
pip install torch numpy pillow
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/kokategithub/ecotourism-suitability.git
cd ecotourism-suitability
```

### 2. Install Node.js dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```
GEE_SERVICE_ACCOUNT=your-service-account@your-project.iam.gserviceaccount.com
GEE_KEY_FILE=service-account.json
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Add your GEE service account key
- Place your Google Earth Engine service account JSON file in the root directory
- Rename it to `service-account.json`
- ⚠️ Never commit this file to GitHub

### 5. Add the ML model files
Place these files in `backend/model/`:
- `attention_unet_dice_ce_best.pth` — Attention U-Net model weights
- `ecotourism_model.pkl` — backup model
- `class_labels.pkl` — class label encoder

> These files are excluded from GitHub due to size. Get them from the project team.

---

## ▶️ Running the Project

You need **two terminals** running simultaneously:

### Terminal 1 — Backend
```bash
node backend/server.js
```
Backend runs on → `http://localhost:3001`

### Terminal 2 — Frontend
```bash
npm run dev
```
Frontend runs on → `http://localhost:5173`

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Locations

| Place | Latitude | Longitude | Expected |
|---|---|---|---|
| Wayanad, Kerala | 11.6854 | 76.1320 | 🟢 Suitable |
| Lonavala, MH | 17.9252 | 73.6581 | 🟡 Moderately Suitable |
| Jaisalmer, RJ | 26.9157 | 70.9083 | ⚫ Not Suitable |

---

## 📁 Project Structure

```
ecotourism-suitability/
├── backend/
│   ├── config/          # Suitability thresholds
│   ├── middleware/       # Request validation
│   ├── model/           # Python inference scripts + model files
│   ├── routes/          # API routes (health, predict)
│   ├── services/        # GEE service + prediction service
│   └── server.js        # Express server entry point
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # Frontend API calls
│   └── types/           # TypeScript types
├── public/              # Static assets
├── .env.example         # Environment variables template
└── package.json
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `GEE_SERVICE_ACCOUNT` | Google Earth Engine service account email |
| `GEE_KEY_FILE` | Path to service account JSON key file |
| `PORT` | Backend server port (default: 3001) |
| `FRONTEND_ORIGIN` | Frontend URL for CORS (default: http://localhost:5173) |

---

## ⚠️ Important Notes

- `service-account.json` and `.env` are **never committed to GitHub**
- Model `.pth` and `.pkl` files are **not included** in the repo (too large)
- The app only works for locations **within India**
- Predictions use **real-time satellite data** — results vary by season

---

## 👩‍💻 Author

**Sakshi Kokate** — [GitHub](https://github.com/kokategithub)

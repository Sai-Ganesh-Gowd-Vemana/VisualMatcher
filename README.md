📸 VisualMatcher

VisualMatcher is a lightweight image-matching backend built using Node.js, Express, Sharp, and pHash hashing for similarity detection.
The app compares an uploaded image with 100 local/online product images, calculates an image perceptual hash, and returns the top visually similar products.

🚀 Features
✅ Offline Image Similarity (No HuggingFace, No API Keys)

Uses a custom pHash (perceptual hash) algorithm to generate image signatures.

✅ 100 Preloaded Products

Includes Electronics, Fashion, Home & Kitchen, Sports categories.

✅ Fast Hash Matching

pHash + Hamming Distance → similarity score (0–100).

✅ Image Upload Support

Supports:

📁 File upload (multipart/form-data)

Any image format supported by Sharp

✅ Preprocessing for Accuracy

All images are resized to 32x32 grayscale before hashing.

📂 Project Structure
VisualMatcher/
│
├── backend/
│   ├── server.js
│   ├── product.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.js
    │   └── components/
    └── package.json

🔧 Backend Setup
⿡ Install dependencies
cd backend
npm install

⿢ Start Backend
npm start

⿣ API Endpoints
🔹 GET /api/products

Returns all products.

🔹 POST /api/search

Upload image → returns top 20 similar products.

Example (using cURL):

curl -X POST -F "image=@sample.jpg" http://localhost:3001/api/search

🤖 How Image Similarity Works
🟦 Step 1: Resize + Grayscale

Every image is normalized:

32 × 32 pixels  
Grayscale  
RAW buffer

🟩 Step 2: Generate pHash

For each pixel:

if pixel > avg_value → 1  
else → 0


This forms a 1024-bit image fingerprint.

🟥 Step 3: Compare Using Hamming Distance
similarity = 100 - HammingDistance(hash1, hash2)


The lower the distance → the higher the similarity.

🖼 Frontend Setup
Install
cd frontend
npm install

Run
npm start

📸 Demo Flow

Upload an image (shoe, laptop, bottle, etc.)

Backend converts it to pHash

Compares with all product images

Returns top 20 similar matches

Frontend displays results with images, similarity %, price, category

📦 Packages Used
Backend:

express – API server

multer – image uploads

sharp – image processing

axios – download product images

Frontend:

React (CRA)

lucide-react icons

Tailwind / JSX UI

☑ Submission Guidelines (Matches University Requirements)

✔ No node_modules
✔ Public GitHub repo
✔ Only essential files
✔ No API keys
✔ Runs fully offline
✔ Clear folder structure

🧑‍💻 Maintainer

Sai Ganesh Gowd Vemana
B.Tech CSE – Parul University


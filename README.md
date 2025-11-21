# BgRemove Pro

AI-Powered background removal with multiple models. Remove backgrounds from images instantly using state-of-the-art AI models.

## Features

- 🎨 **Multiple AI Models**: Rembg (U-2-Net), BiRefNet, Rembg Fast, Rembg Anime
- 🚀 **Fast Processing**: Process single or batch images
- 🎭 **Custom Backgrounds**: Apply solid colors or custom images
- 📊 **Model Comparison**: Compare results from different models side-by-side
- 💾 **Batch Download**: Process and download multiple images as ZIP
- ✨ **Transparency Support**: PNG output with alpha channel

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd bg-remove-pro

# Start with Docker Compose
docker-compose up

# Access the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (models will download automatically on first use)
pip install -r requirements.txt

# Start the backend server
python3 main.py
```

The backend will run on `http://localhost:8001`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Models

All models download automatically on first use:

- **Rembg (U-2-Net)** - ~176MB - Best balance of speed and quality
- **Rembg Fast (U-2-Net-P)** - ~4.7MB - Fastest, smaller model
- **Rembg Anime** - Specialized for anime/illustrations
- **BiRefNet** - ~444MB - State-of-the-art 2024 model (requires GPU for best performance)

## API Documentation

### Remove Background

```bash
POST http://localhost:8001/remove
Content-Type: multipart/form-data

Parameters:
- file: Image file
- model: Model name (rembg, rembg-fast, rembg-anime, birefnet)
- bg_color: Optional hex color (e.g., #FF0000)
- bg_image: Optional background image file

Response: PNG image with removed background
```

### Compare Models

```bash
POST http://localhost:8001/compare
Content-Type: multipart/form-data

Parameters:
- file: Image file

Response: JSON with base64 images from multiple models
```

### List Available Models

```bash
GET http://localhost:8001/models

Response: JSON with available models
```

## Deployment

### Deploy to Vercel (Frontend)

```bash
cd frontend
vercel deploy
```

### Deploy Backend

For backend deployment, we recommend:

- **Railway**: Easy Python deployment with automatic SSL
- **Render**: Free tier available for Python apps
- **Google Cloud Run**: Serverless container deployment
- **AWS Lambda**: With API Gateway for serverless

Example for Railway:

```bash
# Install Railway CLI
npm install -g railway-cli

# Login and deploy
cd backend
railway login
railway init
railway up
```

## Environment Variables

### Backend

- `PORT` - Backend port (default: 8001)

### Frontend

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

For production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, TypeScript
- **Backend**: Python, FastAPI, Rembg, PyTorch, Pillow
- **AI Models**: U-2-Net, BiRefNet, ONNX Runtime

## Performance

- Single image: 2-5 seconds
- Batch processing: Parallel processing supported
- GPU acceleration: Optional for BiRefNet model

## License

MIT License - Feel free to use in your projects

## Credits

- Rembg: https://github.com/danielgatis/rembg
- BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- U-2-Net: https://github.com/xuebinqin/U-2-Net

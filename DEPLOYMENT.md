# Deployment Guide

## Frontend (Vercel) ✅

### Option 1: Vercel CLI (Recommended)

```bash
cd frontend
vercel login
vercel deploy --prod
```

### Option 2: GitHub Integration

1. Go to https://vercel.com
2. Click "Import Project"
3. Connect your GitHub repository: https://github.com/chromahubz/bckremov
4. Root Directory: `frontend`
5. Framework Preset: Next.js
6. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = (your backend URL from step below)

---

## Backend (Choose One)

### Option A: Railway (Easiest for Python)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repo: `chromahubz/bckremov`
5. Root Directory: `backend`
6. Railway will auto-detect Python and use `requirements.txt`
7. Set PORT environment variable: `8001`
8. Copy the deployed URL (e.g., `https://your-app.railway.app`)
9. Add this URL to Vercel as `NEXT_PUBLIC_API_URL`

### Option B: Render

1. Go to https://render.com
2. Create New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `python main.py`
7. Environment Variables:
   - `PORT` = `8001`
8. Copy the deployed URL
9. Add to Vercel as `NEXT_PUBLIC_API_URL`

### Option C: Google Cloud Run

```bash
cd backend
gcloud run deploy bgremove-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Quick Deploy (All in One)

### 1. Deploy Backend to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
cd backend
railway login
railway init
railway up
railway open

# Copy the URL shown
```

### 2. Deploy Frontend to Vercel

```bash
cd frontend

# Set your backend URL
vercel env add NEXT_PUBLIC_API_URL production
# Paste your Railway URL here

# Deploy
vercel deploy --prod
```

---

## Testing Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Upload an image
3. Click "Remove Background"
4. If it works, you're done! 🎉

---

## Troubleshooting

### CORS Errors
Add your Vercel URL to backend CORS in `main.py`:
```python
allow_origins=["https://your-app.vercel.app"]
```

### Backend not responding
- Check Railway/Render logs
- Ensure PORT environment variable is set
- Verify backend URL in Vercel env variables

### Models not downloading
- First request may take 2-3 minutes to download models
- Check backend logs for download progress
- Ensure enough disk space (2GB minimum)

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend
```env
PORT=8001
```

---

## Costs

- **Vercel Frontend**: Free (Hobby plan)
- **Railway Backend**: $5/month (500 hours free trial)
- **Render Backend**: Free tier available
- **Google Cloud Run**: Pay per use (~$1-5/month for light usage)

---

## Support

Repository: https://github.com/chromahubz/bckremov
Issues: https://github.com/chromahubz/bckremov/issues

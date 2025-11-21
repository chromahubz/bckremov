from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from typing import List, Optional
import io
import os
import zipfile
from PIL import Image
import tempfile
from pathlib import Path

# Import background removal libraries
from rembg import remove as rembg_remove
import cv2
import numpy as np

# Check if backgroundremover CLI is available
import shutil
BACKGROUNDREMOVER_AVAILABLE = shutil.which("backgroundremover") is not None or os.path.exists("/Users/unitar/Library/Python/3.9/bin/backgroundremover")
if not BACKGROUNDREMOVER_AVAILABLE:
    print("BackgroundRemover not installed - will use Rembg fallback")
BACKGROUNDREMOVER_CLI = "/Users/unitar/Library/Python/3.9/bin/backgroundremover" if os.path.exists("/Users/unitar/Library/Python/3.9/bin/backgroundremover") else "backgroundremover"

try:
    import torch
    from transformers import AutoModelForImageSegmentation
    from torchvision import transforms
    BIREFNET_AVAILABLE = True
except ImportError:
    BIREFNET_AVAILABLE = False
    print("BiRefNet dependencies not installed - will use Rembg fallback")

app = FastAPI(title="BgRemove Pro API", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported models
MODELS = {
    "rembg": "Rembg (U-2-Net) - Fast & Accurate",
    "rembg-anime": "Rembg Anime - Specialized for Anime",
    "rembg-fast": "Rembg Fast (U-2-Net-P) - Faster, Smaller Model",
}

if BACKGROUNDREMOVER_AVAILABLE:
    MODELS["backgroundremover"] = "BackgroundRemover - Video Support"

if BIREFNET_AVAILABLE:
    MODELS["birefnet"] = "BiRefNet - State-of-the-art 2024"

# Initialize BiRefNet model (lazy loading)
birefnet_model = None
birefnet_transform = None

@app.get("/")
async def root():
    return {
        "message": "BgRemove Pro API",
        "version": "1.0.0",
        "endpoints": {
            "/remove": "POST - Remove background from single image",
            "/batch": "POST - Remove background from multiple images",
            "/models": "GET - List available models"
        }
    }

@app.get("/models")
async def get_models():
    """Get list of available background removal models"""
    return {"models": MODELS}

@app.post("/remove")
async def remove_background(
    file: UploadFile = File(...),
    model: str = Form("rembg"),
    bg_color: Optional[str] = Form(None),
    bg_image: Optional[UploadFile] = File(None)
):
    """
    Remove background from a single image

    Parameters:
    - file: Image file to process
    - model: Model to use (rembg, rembg-anime, rembg-fast)
    - bg_color: Optional hex color for background (e.g., #FFFFFF)
    - bg_image: Optional background image file
    """
    try:
        # Read uploaded image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        # Convert to RGB for processing (models need RGB input)
        # We'll get RGBA output from the background removal
        if input_image.mode not in ['RGB', 'RGBA']:
            input_image = input_image.convert('RGB')

        print(f"  📥 Input image mode: {input_image.mode}, size: {input_image.size}")

        # Remove background using selected model
        output_image = process_image(input_image, model)

        # Debug: Check output image properties
        print(f"  📊 Output image mode: {output_image.mode}")
        print(f"  📊 Output image size: {output_image.size}")
        print(f"  📊 Has alpha channel: {output_image.mode in ['RGBA', 'LA', 'PA']}")

        # Apply custom background if specified
        if bg_color or bg_image:
            output_image = apply_custom_background(output_image, bg_color, bg_image)

        # Ensure RGBA mode for transparency
        if output_image.mode != 'RGBA':
            print(f"  ⚠️  Converting {output_image.mode} to RGBA")
            output_image = output_image.convert('RGBA')

        # Convert to bytes
        img_byte_arr = io.BytesIO()
        output_image.save(img_byte_arr, format='PNG')
        byte_size = img_byte_arr.tell()  # Get size before seeking
        img_byte_arr.seek(0)  # Reset to beginning for reading

        print(f"✅ Successfully processed image with {model} model")
        print(f"  📦 Output size: {byte_size} bytes")

        return StreamingResponse(
            img_byte_arr,
            media_type="image/png"
        )

    except Exception as e:
        print(f"❌ Error processing image: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/batch")
async def batch_remove_background(
    files: List[UploadFile] = File(...),
    model: str = Form("rembg"),
    bg_color: Optional[str] = Form(None)
):
    """
    Remove background from multiple images and return as ZIP

    Parameters:
    - files: List of image files to process
    - model: Model to use for all images
    - bg_color: Optional hex color for background
    """
    try:
        # Create temporary directory for processed images
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Process each image
            for idx, file in enumerate(files):
                contents = await file.read()
                input_image = Image.open(io.BytesIO(contents))

                if input_image.mode != 'RGB':
                    input_image = input_image.convert('RGB')

                # Remove background
                output_image = process_image(input_image, model)

                # Apply custom background if specified
                if bg_color:
                    output_image = apply_custom_background(output_image, bg_color, None)

                # Save processed image
                output_filename = f"removed_{Path(file.filename).stem}.png"
                output_path = temp_path / output_filename
                output_image.save(output_path, format='PNG')

            # Create ZIP file
            zip_path = temp_path / "batch_results.zip"
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for file_path in temp_path.glob("*.png"):
                    zipf.write(file_path, file_path.name)

            # Read ZIP file into memory
            with open(zip_path, 'rb') as f:
                zip_data = io.BytesIO(f.read())

            zip_data.seek(0)
            return StreamingResponse(
                zip_data,
                media_type="application/zip",
                headers={
                    "Content-Disposition": "attachment; filename=batch_results.zip"
                }
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing batch: {str(e)}")

@app.post("/compare")
async def compare_models(
    file: UploadFile = File(...)
):
    """
    Process image with all available models for comparison

    Returns: JSON with base64 encoded results from each model
    """
    try:
        import base64

        # Read uploaded image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        if input_image.mode != 'RGB':
            input_image = input_image.convert('RGB')

        results = {}

        # Process with each model
        for model_key in ["rembg", "rembg-fast"]:
            output_image = process_image(input_image, model_key)

            # Convert to base64
            img_byte_arr = io.BytesIO()
            output_image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            base64_image = base64.b64encode(img_byte_arr.read()).decode('utf-8')

            results[model_key] = {
                "name": MODELS[model_key],
                "image": f"data:image/png;base64,{base64_image}"
            }

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing models: {str(e)}")

# Helper functions
def process_image(input_image: Image.Image, model: str) -> Image.Image:
    """Process image with selected model"""
    print(f"🔄 Processing with model: {model}")

    # BiRefNet processing
    if model == "birefnet" and BIREFNET_AVAILABLE:
        print("  → Using BiRefNet model")
        return process_with_birefnet(input_image)

    # BackgroundRemover processing
    if model == "backgroundremover" and BACKGROUNDREMOVER_AVAILABLE:
        print("  → Using BackgroundRemover CLI")
        return process_with_backgroundremover(input_image)

    # Rembg processing (default)
    print(f"  → Using Rembg model variant: {model}")

    # Convert PIL Image to bytes
    img_byte_arr = io.BytesIO()
    input_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    input_bytes = img_byte_arr.read()

    # Select model type for rembg
    if model == "rembg-anime":
        print("    • Rembg with anime mode")
        output_bytes = rembg_remove(input_bytes, alpha_matting=True, only_mask=False)
    elif model == "rembg-fast":
        print("    • Rembg with fast mode (u2netp)")
        from rembg import new_session
        session = new_session("u2netp")
        output_bytes = rembg_remove(input_bytes, session=session)
    else:  # default rembg
        print("    • Rembg with standard mode (u2net)")
        output_bytes = rembg_remove(input_bytes, alpha_matting=True)

    # Convert back to PIL Image
    output_image = Image.open(io.BytesIO(output_bytes))

    return output_image

def process_with_birefnet(input_image: Image.Image) -> Image.Image:
    """Process image using BiRefNet model"""
    global birefnet_model, birefnet_transform

    try:
        # Lazy load BiRefNet model
        if birefnet_model is None:
            print("Loading BiRefNet model...")
            birefnet_model = AutoModelForImageSegmentation.from_pretrained(
                "ZhengPeng7/BiRefNet",
                trust_remote_code=True
            )
            birefnet_model.eval()

            # Setup transform
            birefnet_transform = transforms.Compose([
                transforms.Resize((1024, 1024)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
            ])

        # Process image
        with torch.no_grad():
            input_tensor = birefnet_transform(input_image).unsqueeze(0)
            output = birefnet_model(input_tensor)[0]
            mask = output.sigmoid().cpu().numpy()[0, 0]

        # Create RGBA image
        result = input_image.convert("RGBA")
        mask_image = Image.fromarray((mask * 255).astype(np.uint8)).resize(result.size)
        result.putalpha(mask_image)

        return result

    except Exception as e:
        print(f"BiRefNet error, falling back to Rembg: {e}")
        # Fallback to rembg
        img_byte_arr = io.BytesIO()
        input_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        output_bytes = rembg_remove(img_byte_arr.read(), alpha_matting=True)
        return Image.open(io.BytesIO(output_bytes))

def process_with_backgroundremover(input_image: Image.Image) -> Image.Image:
    """Process image using BackgroundRemover CLI"""
    try:
        import subprocess

        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_input:
            input_image.save(tmp_input.name)
            input_path = tmp_input.name

        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_output:
            output_path = tmp_output.name

        # Process with backgroundremover CLI
        result = subprocess.run(
            [BACKGROUNDREMOVER_CLI, "-i", input_path, "-o", output_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            raise Exception(f"BackgroundRemover CLI failed: {result.stderr}")

        # Load result
        output_image = Image.open(output_path)

        # Cleanup
        os.unlink(input_path)
        os.unlink(output_path)

        return output_image

    except Exception as e:
        print(f"BackgroundRemover error, falling back to Rembg: {e}")
        # Fallback to rembg
        img_byte_arr = io.BytesIO()
        input_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        output_bytes = rembg_remove(img_byte_arr.read(), alpha_matting=True)
        return Image.open(io.BytesIO(output_bytes))

def apply_custom_background(
    image: Image.Image,
    bg_color: Optional[str] = None,
    bg_image_file: Optional[UploadFile] = None
) -> Image.Image:
    """Apply custom background to transparent image"""

    print(f"  🎨 Applying custom background - color: {bg_color}, image: {bg_image_file is not None}")

    # Create background
    background = Image.new('RGBA', image.size)

    if bg_image_file:
        # Use uploaded image as background
        bg_contents = bg_image_file.file.read()
        bg_img = Image.open(io.BytesIO(bg_contents))
        bg_img = bg_img.resize(image.size, Image.Resampling.LANCZOS)
        background = bg_img.convert('RGBA')
        print(f"    • Applied background image")
    elif bg_color:
        # Use solid color as background
        # Convert hex color to RGB
        hex_color = bg_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        background = Image.new('RGBA', image.size, rgb + (255,))
        print(f"    • Applied background color: {bg_color} -> RGB{rgb}")

    # Composite image over background
    if image.mode != 'RGBA':
        image = image.convert('RGBA')

    result = Image.alpha_composite(background, image)
    print(f"    • Composited image over background, result mode: {result.mode}")

    # Keep as RGBA to preserve any remaining transparency
    return result

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

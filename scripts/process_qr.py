
import sys
try:
    from PIL import Image
    print("PIL: available")
    im = Image.open(r"C:/Users/MY-PC/.gemini/antigravity/brain/d6f1ebca-07d3-4704-a1d0-5615b737a8e1/.user_uploaded/media_1793547443233_3f8b97d5.png")
    print("Dimensions:", im.size)
    # crop the QR code area:
    # Based on the screenshot, the QR code is roughly centered in the upper box
    # Let's save a clean crop of the QR box
    # Image size is roughly 600x600 or similar
    w, h = im.size
    # crop QR area: (left, top, right, bottom)
    qr_crop = im.crop((int(w * 0.28), int(h * 0.24), int(w * 0.72), int(h * 0.62)))
    out_dir = r"C:/Users/MY-PC/Documents/patron.colorwall.xyz/public/assets/crypto"
    import os
    os.makedirs(out_dir, exist_ok=True)
    qr_crop.save(os.path.join(out_dir, "liquid_qr.png"))
    print("Saved cropped QR to", os.path.join(out_dir, "liquid_qr.png"))
except Exception as e:
    print("Error:", e)

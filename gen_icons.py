from PIL import Image
import os

source = "kitnova-icon.jpg"
img = Image.open(source).convert("RGBA")

# Create the web/PWA icons as real PNG files
for path, size in [
    ("public/icon-512.png", 512),
    ("public/icon-192.png", 192),
]:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, format="PNG")
    print(f"Created {path}: {size}x{size}")

# Generate Android launcher icons
sizes = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

for density, size in sizes.items():
    folder = f"android/app/src/main/res/mipmap-{density}"
    os.makedirs(folder, exist_ok=True)

    for name in ["ic_launcher.png", "ic_launcher_round.png"]:
        path = os.path.join(folder, name)
        resized = img.resize(
            (size, size),
            Image.Resampling.LANCZOS
        )
        resized.save(path, format="PNG")
        print(f"Created {path}: {size}x{size}")

print("\nAll icons generated successfully.")

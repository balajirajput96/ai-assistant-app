from pathlib import Path

from PIL import Image


PROJECT = Path("/home/ubuntu/orbit-ai-assistant")
SOURCE = Path("/home/ubuntu/webdev-static-assets/orbit-logo.png")
TARGETS = [
    PROJECT / "assets/images/icon.png",
    PROJECT / "assets/images/splash-icon.png",
    PROJECT / "assets/images/favicon.png",
    PROJECT / "assets/images/android-icon-foreground.png",
]

with Image.open(SOURCE) as image:
    rendered = image.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
    for target in TARGETS:
        rendered.save(target, format="PNG", optimize=True, compress_level=9)

for target in TARGETS:
    print(f"{target.name}: {target.stat().st_size} bytes")

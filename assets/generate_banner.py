"""Generate Orbyt subreddit banner as PNG."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

WIDTH, HEIGHT = 2144, 256
BG = (0, 0, 0)
GREEN = (34, 204, 34)
BRIGHT_GREEN = (51, 255, 51)
DARK_GREEN = (26, 154, 26)
DIM_GREEN = (17, 119, 17)
AMBER = (255, 170, 0)

def find_font(size):
    """Try to find a monospace font."""
    candidates = [
        "C:/Windows/Fonts/consola.ttf",    # Consolas
        "C:/Windows/Fonts/cour.ttf",       # Courier New
        "C:/Windows/Fonts/lucon.ttf",      # Lucida Console
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def find_bold_font(size):
    """Try to find a bold monospace font."""
    candidates = [
        "C:/Windows/Fonts/consolab.ttf",   # Consolas Bold
        "C:/Windows/Fonts/courbd.ttf",     # Courier New Bold
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return find_font(size)

def draw_glow_text(img, xy, text, font, color, glow_radius=4, glow_color=None):
    """Draw text with a glow effect."""
    if glow_color is None:
        glow_color = tuple(c // 3 for c in color)

    # Create glow layer
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.text(xy, text, font=font, fill=(*glow_color, 180), anchor="mm")
    glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_radius))

    # Composite glow
    img.paste(Image.alpha_composite(
        img.convert("RGBA"), glow
    ).convert("RGB"))

    # Draw sharp text on top
    draw = ImageDraw.Draw(img)
    draw.text(xy, text, font=font, fill=color, anchor="mm")
    return draw

def draw_satellite(draw, cx, cy, color, opacity_factor=0.7):
    """Draw a small satellite icon."""
    c = tuple(int(v * opacity_factor) for v in color)
    dim = tuple(int(v * opacity_factor * 0.6) for v in color)

    # Body (diamond shape)
    size = 7
    draw.polygon([
        (cx, cy - size), (cx + size, cy),
        (cx, cy + size), (cx - size, cy)
    ], outline=c, width=1)

    # Solar panel arms
    draw.line([(cx - size - 2, cy), (cx - size - 14, cy)], fill=c, width=1)
    draw.line([(cx + size + 2, cy), (cx + size + 14, cy)], fill=c, width=1)

    # Solar panels
    draw.rectangle(
        [(cx - size - 28, cy - 5), (cx - size - 14, cy + 5)],
        outline=dim, width=1
    )
    draw.rectangle(
        [(cx + size + 14, cy - 5), (cx + size + 28, cy + 5)],
        outline=dim, width=1
    )

    # Antenna
    draw.line([(cx, cy - size - 2), (cx, cy - size - 12)], fill=c, width=1)
    draw.ellipse(
        [(cx - 2, cy - size - 16), (cx + 2, cy - size - 12)],
        fill=BRIGHT_GREEN
    )

def draw_signal_arcs(draw, cx, cy, direction=1):
    """Draw signal wave arcs emanating from a point."""
    for i, (radius, opacity) in enumerate([(18, 0.5), (30, 0.35), (42, 0.2)]):
        c = tuple(int(v * opacity) for v in GREEN)
        start_angle = -60 if direction == 1 else 120
        end_angle = 60 if direction == 1 else 240
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.arc(bbox, start_angle, end_angle, fill=c, width=1)

def draw_orbit_rings(draw, cx, cy, opacity_factor=0.3):
    """Draw concentric dashed orbit rings."""
    for radius, dash, op in [(40, 8, 0.6), (65, 6, 0.4), (90, 4, 0.25)]:
        c = tuple(int(v * opacity_factor * op) for v in GREEN)
        # Draw dashed circle
        steps = 60
        for j in range(steps):
            if j % 3 == 0:  # Skip every 3rd segment for dash effect
                continue
            a1 = 2 * math.pi * j / steps
            a2 = 2 * math.pi * (j + 1) / steps
            x1 = cx + radius * math.cos(a1)
            y1 = cy + radius * math.sin(a1)
            x2 = cx + radius * math.cos(a2)
            y2 = cy + radius * math.sin(a2)
            draw.line([(x1, y1), (x2, y2)], fill=c, width=1)

def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # --- Subtle grid lines ---
    for y in [64, 128, 192]:
        c = tuple(int(v * 0.06) for v in GREEN)
        draw.line([(0, y), (WIDTH, y)], fill=c, width=1)

    # --- Orbit rings ---
    draw_orbit_rings(draw, 320, 128)
    draw_orbit_rings(draw, 1824, 128)

    # --- Satellites ---
    draw_satellite(draw, 310, 115, GREEN)
    draw_satellite(draw, 1834, 115, GREEN)

    # --- Signal arcs from satellites ---
    draw_signal_arcs(draw, 348, 115, direction=1)
    draw_signal_arcs(draw, 1796, 115, direction=-1)

    # --- Horizontal signal lines with gradient ---
    for i in range(450):
        t = i / 450.0
        # Left line (fading left to center)
        alpha = max(0, 0.4 * (1 - t))
        if t < 0.4:
            c = tuple(int(v * alpha) for v in BRIGHT_GREEN)
        elif t < 0.7:
            c = tuple(int(v * alpha) for v in AMBER)
        else:
            c = tuple(int(v * alpha * 0.3) for v in (255, 51, 51))
        x = 100 + i
        draw.point((x, 128), fill=c)
        # Right line (fading right to center)
        x = 2044 - i
        draw.point((x, 128), fill=c)

    # --- Scattered stars ---
    stars_green = [
        (150, 45, 1.0), (230, 200, 1.2), (480, 70, 0.8), (520, 190, 1.0),
        (680, 50, 1.2), (1460, 55, 1.0), (1620, 195, 1.2), (1700, 65, 0.8),
        (1900, 45, 1.0), (1980, 180, 1.2), (60, 100, 0.8), (2080, 90, 0.8),
        (190, 150, 0.6), (750, 200, 0.9), (1350, 42, 0.7), (2000, 120, 0.6),
        (100, 210, 0.7), (1550, 100, 0.8), (850, 35, 0.6), (1250, 210, 0.7),
    ]
    for x, y, r in stars_green:
        opacity = 0.2 + (r / 1.2) * 0.3
        c = tuple(int(v * opacity) for v in GREEN)
        if r <= 0.8:
            draw.point((x, y), fill=c)
        else:
            draw.ellipse([(x-1, y-1), (x+1, y+1)], fill=c)

    # Amber stars
    for x, y in [(420, 40), (1750, 210), (600, 230), (1500, 30)]:
        c = tuple(int(v * 0.25) for v in AMBER)
        draw.point((x, y), fill=c)

    # --- Terminal cursor blink ---
    draw.rectangle([(558, 146), (561, 164)], fill=tuple(int(v * 0.35) for v in GREEN))

    # --- Border lines ---
    border_color = tuple(int(v * 0.4) for v in DARK_GREEN)
    draw.line([(450, 38), (1694, 38)], fill=border_color, width=1)
    draw.line([(450, 218), (1694, 218)], fill=border_color, width=1)

    # --- Corner brackets ---
    bracket_color = tuple(int(v * 0.5) for v in GREEN)
    # Top-left
    draw.line([(450, 58), (450, 38)], fill=bracket_color, width=1)
    draw.line([(450, 38), (470, 38)], fill=bracket_color, width=1)
    # Top-right
    draw.line([(1694, 58), (1694, 38)], fill=bracket_color, width=1)
    draw.line([(1694, 38), (1674, 38)], fill=bracket_color, width=1)
    # Bottom-left
    draw.line([(450, 198), (450, 218)], fill=bracket_color, width=1)
    draw.line([(450, 218), (470, 218)], fill=bracket_color, width=1)
    # Bottom-right
    draw.line([(1694, 198), (1694, 218)], fill=bracket_color, width=1)
    draw.line([(1694, 218), (1674, 218)], fill=bracket_color, width=1)

    # --- Text with glow ---
    title_font = find_bold_font(72)
    tagline_font = find_font(20)
    subtitle_font = find_font(13)

    # Title: ORBYT
    cx, cy_title = WIDTH // 2, 100
    draw_glow_text(img, (cx, cy_title), "O R B Y T", title_font, GREEN,
                   glow_radius=8, glow_color=(10, 80, 10))
    draw = ImageDraw.Draw(img)

    # Tagline
    draw_glow_text(img, (cx, 152), "KEEP  YOUR  PEOPLE  IN  ORBIT", tagline_font,
                   DARK_GREEN, glow_radius=3, glow_color=(8, 50, 8))
    draw = ImageDraw.Draw(img)

    # Subtitle (terminal prompt style)
    sub_color = tuple(int(v * 0.6) for v in DIM_GREEN)
    draw.text((cx, 192), "> a fitness tracker for your relationships_",
              font=subtitle_font, fill=sub_color, anchor="mm")

    # --- CRT Scanlines ---
    scanline_overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    scanline_draw = ImageDraw.Draw(scanline_overlay)
    for y in range(0, HEIGHT, 4):
        scanline_draw.line([(0, y + 2), (WIDTH, y + 2)], fill=(0, 0, 0, 50), width=2)

    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, scanline_overlay)

    # --- Vignette ---
    vignette = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    vignette_draw = ImageDraw.Draw(vignette)
    cx_v, cy_v = WIDTH // 2, HEIGHT // 2
    max_dist = math.sqrt(cx_v**2 + cy_v**2)
    # Apply vignette in bands for performance
    for y in range(0, HEIGHT, 2):
        for x in range(0, WIDTH, 4):
            dist = math.sqrt((x - cx_v)**2 + (y - cy_v)**2) / max_dist
            if dist > 0.5:
                alpha = int(min(120, (dist - 0.5) * 240))
                vignette_draw.rectangle([(x, y), (x + 3, y + 1)], fill=(0, 0, 0, alpha))

    img_rgba = Image.alpha_composite(img_rgba, vignette)

    # Convert back to RGB and save
    final = img_rgba.convert("RGB")

    output_path = os.path.join(os.path.dirname(__file__), "subreddit-banner.png")
    final.save(output_path, "PNG", optimize=True)
    print(f"Banner saved to: {output_path}")
    print(f"Dimensions: {final.size[0]} x {final.size[1]}")

if __name__ == "__main__":
    main()

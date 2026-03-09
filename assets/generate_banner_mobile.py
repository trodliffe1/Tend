"""Generate Orbyt subreddit mobile banner as PNG."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
import os

WIDTH, HEIGHT = 2160, 256
BG = (0, 0, 0)
GREEN = (34, 204, 34)
BRIGHT_GREEN = (51, 255, 51)
DARK_GREEN = (26, 154, 26)
DIM_GREEN = (17, 119, 17)
AMBER = (255, 170, 0)

def find_font(size):
    candidates = [
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/cour.ttf",
        "C:/Windows/Fonts/lucon.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def find_bold_font(size):
    candidates = [
        "C:/Windows/Fonts/consolab.ttf",
        "C:/Windows/Fonts/courbd.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return find_font(size)

def draw_glow_text(img, xy, text, font, color, glow_radius=4, glow_color=None):
    if glow_color is None:
        glow_color = tuple(c // 3 for c in color)
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.text(xy, text, font=font, fill=(*glow_color, 180), anchor="mm")
    glow = glow.filter(ImageFilter.GaussianBlur(radius=glow_radius))
    img.paste(Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB"))
    draw = ImageDraw.Draw(img)
    draw.text(xy, text, font=font, fill=color, anchor="mm")
    return draw

def draw_satellite(draw, cx, cy, color, scale=1.0, opacity_factor=0.7):
    c = tuple(int(v * opacity_factor) for v in color)
    dim = tuple(int(v * opacity_factor * 0.6) for v in color)
    s = int(7 * scale)
    arm = int(14 * scale)
    panel_w = int(12 * scale)
    panel_h = int(5 * scale)

    draw.polygon([
        (cx, cy - s), (cx + s, cy),
        (cx, cy + s), (cx - s, cy)
    ], outline=c, width=1)
    draw.line([(cx - s - 2, cy), (cx - s - arm, cy)], fill=c, width=1)
    draw.line([(cx + s + 2, cy), (cx + s + arm, cy)], fill=c, width=1)
    draw.rectangle(
        [(cx - s - arm - panel_w, cy - panel_h), (cx - s - arm, cy + panel_h)],
        outline=dim, width=1
    )
    draw.rectangle(
        [(cx + s + arm, cy - panel_h), (cx + s + arm + panel_w, cy + panel_h)],
        outline=dim, width=1
    )
    draw.line([(cx, cy - s - 2), (cx, cy - s - 10)], fill=c, width=1)
    draw.ellipse([(cx - 2, cy - s - 14), (cx + 2, cy - s - 10)], fill=BRIGHT_GREEN)

def draw_signal_arcs(draw, cx, cy, direction=1):
    for radius, opacity in [(16, 0.5), (26, 0.35), (36, 0.2)]:
        c = tuple(int(v * opacity) for v in GREEN)
        start_angle = -60 if direction == 1 else 120
        end_angle = 60 if direction == 1 else 240
        bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
        draw.arc(bbox, start_angle, end_angle, fill=c, width=1)

def draw_orbit_rings(draw, cx, cy, opacity_factor=0.3):
    for radius, op in [(35, 0.6), (55, 0.4), (78, 0.25)]:
        c = tuple(int(v * opacity_factor * op) for v in GREEN)
        steps = 60
        for j in range(steps):
            if j % 3 == 0:
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
    cx = WIDTH // 2

    # --- Subtle grid lines ---
    for y in [64, 128, 192]:
        c = tuple(int(v * 0.06) for v in GREEN)
        draw.line([(0, y), (WIDTH, y)], fill=c, width=1)

    # --- Orbit rings (pulled closer to center for mobile) ---
    draw_orbit_rings(draw, 420, 128)
    draw_orbit_rings(draw, WIDTH - 420, 128)

    # --- Satellites ---
    draw_satellite(draw, 412, 115, GREEN, scale=0.9)
    draw_satellite(draw, WIDTH - 412, 115, GREEN, scale=0.9)

    # --- Signal arcs ---
    draw_signal_arcs(draw, 445, 115, direction=1)
    draw_signal_arcs(draw, WIDTH - 445, 115, direction=-1)

    # --- Horizontal signal lines ---
    for i in range(350):
        t = i / 350.0
        alpha = max(0, 0.4 * (1 - t))
        if t < 0.4:
            c = tuple(int(v * alpha) for v in BRIGHT_GREEN)
        elif t < 0.7:
            c = tuple(int(v * alpha) for v in AMBER)
        else:
            c = tuple(int(v * alpha * 0.3) for v in (255, 51, 51))
        draw.point((200 + i, 128), fill=c)
        draw.point((WIDTH - 200 - i, 128), fill=c)

    # --- Scattered stars ---
    stars_green = [
        (100, 45, 1.0), (180, 200, 1.2), (350, 70, 0.8), (500, 190, 1.0),
        (650, 50, 1.2), (1500, 55, 1.0), (1650, 195, 1.2), (1780, 65, 0.8),
        (1950, 45, 1.0), (2050, 180, 1.2), (60, 100, 0.8), (2100, 90, 0.8),
        (250, 150, 0.6), (700, 210, 0.9), (1400, 42, 0.7), (2020, 120, 0.6),
        (130, 220, 0.7), (1580, 100, 0.8), (820, 35, 0.6), (1300, 215, 0.7),
    ]
    for x, y, r in stars_green:
        opacity = 0.2 + (r / 1.2) * 0.3
        c = tuple(int(v * opacity) for v in GREEN)
        if r <= 0.8:
            draw.point((x, y), fill=c)
        else:
            draw.ellipse([(x-1, y-1), (x+1, y+1)], fill=c)

    for x, y in [(380, 40), (1800, 210), (550, 230), (1550, 30)]:
        c = tuple(int(v * 0.25) for v in AMBER)
        draw.point((x, y), fill=c)

    # --- Border lines (tighter frame for mobile) ---
    frame_l, frame_r = 520, WIDTH - 520
    border_color = tuple(int(v * 0.4) for v in DARK_GREEN)
    draw.line([(frame_l, 38), (frame_r, 38)], fill=border_color, width=1)
    draw.line([(frame_l, 218), (frame_r, 218)], fill=border_color, width=1)

    # --- Corner brackets ---
    bracket_color = tuple(int(v * 0.5) for v in GREEN)
    draw.line([(frame_l, 58), (frame_l, 38)], fill=bracket_color, width=1)
    draw.line([(frame_l, 38), (frame_l + 20, 38)], fill=bracket_color, width=1)
    draw.line([(frame_r, 58), (frame_r, 38)], fill=bracket_color, width=1)
    draw.line([(frame_r, 38), (frame_r - 20, 38)], fill=bracket_color, width=1)
    draw.line([(frame_l, 198), (frame_l, 218)], fill=bracket_color, width=1)
    draw.line([(frame_l, 218), (frame_l + 20, 218)], fill=bracket_color, width=1)
    draw.line([(frame_r, 198), (frame_r, 218)], fill=bracket_color, width=1)
    draw.line([(frame_r, 218), (frame_r - 20, 218)], fill=bracket_color, width=1)

    # --- Text with glow (slightly larger for mobile readability) ---
    title_font = find_bold_font(78)
    tagline_font = find_font(22)
    subtitle_font = find_font(14)

    draw_glow_text(img, (cx, 98), "O R B Y T", title_font, GREEN,
                   glow_radius=8, glow_color=(10, 80, 10))
    draw = ImageDraw.Draw(img)

    draw_glow_text(img, (cx, 152), "KEEP  YOUR  PEOPLE  IN  ORBIT", tagline_font,
                   DARK_GREEN, glow_radius=3, glow_color=(8, 50, 8))
    draw = ImageDraw.Draw(img)

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
    for y in range(0, HEIGHT, 2):
        for x in range(0, WIDTH, 4):
            dist = math.sqrt((x - cx_v)**2 + (y - cy_v)**2) / max_dist
            if dist > 0.5:
                alpha = int(min(120, (dist - 0.5) * 240))
                vignette_draw.rectangle([(x, y), (x + 3, y + 1)], fill=(0, 0, 0, alpha))

    img_rgba = Image.alpha_composite(img_rgba, vignette)
    final = img_rgba.convert("RGB")

    output_path = os.path.join(os.path.dirname(__file__), "subreddit-banner-mobile.png")
    final.save(output_path, "PNG", optimize=True)
    print(f"Banner saved to: {output_path}")
    print(f"Dimensions: {final.size[0]} x {final.size[1]}")

if __name__ == "__main__":
    main()

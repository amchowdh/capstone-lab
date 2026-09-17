"""Generate a rough wireframe sketch of the Trivia Night live leaderboard.

This produces docs/artifacts/leaderboard-ui-sketch.png — the real image file
used as visual context (via "Add Context") when implementing the leaderboard
screen in Step 3. Intentionally rough/wireframe, not pixel-perfect.

Run: python3 docs/artifacts/leaderboard-sketch.py
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 640, 780
INK = (40, 40, 40)
MUTED = (120, 120, 120)
BRAND = (25, 118, 210)          # #1976d2
BRAND_LIGHT = (227, 242, 253)   # light highlight for 1st place
CHIP = (255, 224, 130)          # "TIE" chip
PAPER = (250, 250, 250)


def load_font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()


def star(draw, cx, cy, r, fill):
    points = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        radius = r if i % 2 == 0 else r * 0.45
        points.append((cx + radius * math.cos(angle), cy - radius * math.sin(angle)))
    draw.polygon(points, fill=fill)


img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

f_title = load_font(30)
f_sub = load_font(18)
f_head = load_font(16)
f_row = load_font(22)
f_pts = load_font(26)
f_chip = load_font(13)
f_note = load_font(15)

# Outer "screen" frame (hand-drawn wireframe look)
d.rounded_rectangle([12, 12, W - 12, H - 12], radius=18, outline=INK, width=3)

# Header band
d.rounded_rectangle([12, 12, W - 12, 92], radius=18, outline=INK, width=3, fill=BRAND)
d.text((36, 30), "TRIVIA NIGHT", font=f_title, fill=(255, 255, 255))
d.text((38, 66), "Live Leaderboard", font=f_sub, fill=(230, 240, 255))
# progress indicator (top-right)
d.text((W - 210, 40), "Round 3 of 3 scored", font=f_sub, fill=(255, 255, 255))

# Column headers
y = 116
d.text((44, y), "RANK", font=f_head, fill=MUTED)
d.text((150, y), "TEAM", font=f_head, fill=MUTED)
d.text((W - 130, y), "POINTS", font=f_head, fill=MUTED)
d.line([28, y + 26, W - 28, y + 26], fill=INK, width=2)

rows = [
    (1, "Quiz Lords", 58, False, True),
    (2, "The Brainiacs", 47, False, False),
    (3, "Wit & Wisdom", 42, True, False),
    (3, "Trivia Newton-John", 42, True, False),
    (5, "Anonymice", 31, False, False),
]

row_h = 74
y = 158
for rank, name, pts, tied, first in rows:
    box = [28, y, W - 28, y + row_h - 12]
    if first:
        d.rounded_rectangle(box, radius=12, outline=BRAND, width=3, fill=BRAND_LIGHT)
    else:
        d.rounded_rectangle(box, radius=12, outline=INK, width=2)

    # rank
    d.text((52, y + 20), f"{rank}", font=f_pts, fill=INK)
    if first:
        star(d, 96, y + (row_h - 12) / 2, 15, BRAND)

    # team name
    d.text((150, y + 22), name, font=f_row, fill=INK)

    # TIE chip
    if tied:
        tw = 46
        tx = 150 + d.textlength(name, font=f_row) + 14
        d.rounded_rectangle([tx, y + 22, tx + tw, y + 46], radius=10, fill=CHIP)
        d.text((tx + 9, y + 25), "TIE", font=f_chip, fill=(90, 70, 0))

    # points (right aligned, big)
    pts_str = str(pts)
    pw = d.textlength(pts_str, font=f_pts)
    d.text((W - 52 - pw, y + 18), pts_str, font=f_pts, fill=BRAND if first else INK)

    y += row_h

# Footer note
d.text((36, H - 56), "Updates after each round is scored · missing score = 0",
       font=f_note, fill=MUTED)

out = os.path.join(os.path.dirname(__file__), "leaderboard-ui-sketch.png")
img.save(out)
print(f"wrote {out} ({W}x{H})")

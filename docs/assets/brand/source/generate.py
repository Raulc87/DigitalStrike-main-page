import sys, os
OUT = sys.argv[1]
NAVY, TEAL, SEAM, OFF, CYAN, MUTED, MONO = "#0B1F44", "#0E8A9B", "#8CCBD4", "#F5F7F8", "#21C7D9", "#AEB8C9", "#111315"
# Owner-supplied ball geometry (DigitalStrike_Logo.svg, 2026-10-12), in its own 165.19-unit box.
SEAMS = ["M22.03,135.33c40.42-21.16,80.84-21.16,121.25,0","M36.65,137.08l-8.44-4.73,1.58-9.46","M53.8,131.05l-7.6-5.84,2.87-9.18",
 "M70.86,127.8l-6.77-6.95,4.27-8.62","M87.65,127.34l-5.56-7.88,5.56-7.88","M104.24,129.57l-4.17-8.72,6.68-6.86",
 "M120.84,134.39l-2.87-9.18,7.7-5.84","M136.6,140.97l-1.58-9.55,8.34-4.64","M22.21,29.62c40.22,21.66,80.44,21.66,120.67,0",
 "M30.72,42.43l-1.58-9.46,8.44-4.73","M49.08,49.29l-2.87-9.18,7.6-5.84","M68.36,53.1l-4.27-8.62,6.77-6.95",
 "M87.65,53.75l-5.56-7.88,5.56-7.88","M106.75,51.33l-6.68-6.86,4.17-8.72","M125.66,45.96l-7.7-5.84,2.87-9.18",
 "M143.37,38.54l-8.34-4.64,1.58-9.55"]
CURSOR = ["M55.78,61.95l22.1,19.78-22.1,19.78", "M88.36,103.83h25.59"]
C, R = 82.59, 81.59

def ball(cx, cy, r, gid, outline, seam, cursor, ow, sw, cw, fill=None):
    s = r / R
    tx, ty = cx - C * s, cy - C * s
    f = fill or f"url(#{gid})"
    defs = "" if fill else (f'<defs><radialGradient id="{gid}" cx="{C}" cy="{C}" r="{R}" gradientUnits="userSpaceOnUse">'
            '<stop offset="0" stop-color="#FFFFFF"/><stop offset=".72" stop-color="#F4F6F9"/><stop offset="1" stop-color="#DDE3EB"/></radialGradient></defs>')
    g = f'<g transform="translate({tx:.3f} {ty:.3f}) scale({s:.5f})">'
    g += f'<circle cx="{C}" cy="{C}" r="{R}" fill="{f}" stroke="{outline}" stroke-width="{ow}"/>'
    g += f'<g fill="none" stroke="{seam}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">' + "".join(f'<path d="{d}"/>' for d in SEAMS) + '</g>'
    g += f'<g fill="none" stroke="{cursor}" stroke-width="{cw}" stroke-linecap="round" stroke-linejoin="round">' + "".join(f'<path d="{d}"/>' for d in CURSOR) + '</g></g>'
    return defs + g

def svg(vb, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="DigitalStrike Solutions">{body}</svg>\n'

FONT = "font-family:Archivo,'Archivo Black',Montserrat,system-ui,sans-serif"
def words(fg, accent, tag, rule):
    return (f'<path d="M222 40 V160" stroke="{rule}" stroke-width="2" opacity=".35"/>'
      f'<text x="246" y="92" style="{FONT};font-weight:800;font-size:60px;letter-spacing:-.02em" fill="{fg}">DigitalStrike</text>'
      f'<text x="246" y="151" style="{FONT};font-weight:800;font-size:60px;letter-spacing:-.02em" fill="{accent}">Solutions</text>'
      f'<text x="248" y="185" style="{FONT};font-weight:500;font-size:18px;letter-spacing:.22em" fill="{tag}">WE STRIKE OUT YOUR SOFTWARE NEEDS</text>')

files = {
 "logo-mark.svg": svg("0 0 200 200", ball(100,100,88,"dsBall",NAVY,SEAM,NAVY,2,1.3,5)),
 "logo-mark-on-dark.svg": svg("0 0 200 200", ball(100,100,88,"dsBallO",OFF,SEAM,NAVY,2,1.6,5.5)),
 "logo-mark-mono.svg": svg("0 0 200 200", ball(100,100,88,None,MONO,MONO,MONO,3,1.6,5.5,fill="#FFFFFF")),
 "logo-horizontal-light.svg": svg("0 0 760 200", ball(100,100,88,"dsBall",NAVY,SEAM,NAVY,2,1.3,5) + words(NAVY,TEAL,NAVY,NAVY)),
 "logo-horizontal-dark.svg": svg("0 0 760 200", ball(100,100,88,"dsBallD",OFF,SEAM,NAVY,2,1.6,5.5) + words(OFF,CYAN,MUTED,OFF)),
 "logo-header-dark.svg": svg("0 0 330 64", ball(32,32,28,"dsBallH",OFF,"#6FB9C4",NAVY,3,3,9) +
    f'<text x="72" y="30" style="{FONT};font-weight:800;font-size:22px;letter-spacing:-.02em"><tspan fill="{OFF}">DigitalStrike</tspan><tspan fill="{CYAN}" dx="5">Solutions</tspan></text>'),
 "favicon.svg": svg("0 0 64 64", f'<rect width="64" height="64" rx="14" fill="{NAVY}"/>' + ball(32,32,24,"dsBallF","#FFFFFF","#5FAFBB",NAVY,4,4.5,11)),
}
os.makedirs(OUT, exist_ok=True)
for n, c in files.items():
    open(os.path.join(OUT, n), "w").write(c)
print("ok", len(files))

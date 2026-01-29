from PIL import Image, ImageDraw, ImageFont
import os

def create_og_image(filename, title, subtitle, emoji, domain):
    img = Image.new('RGB', (1200, 630), '#0a0a0a')
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([0, 0, 1200, 8], fill='#FF2D2D')
    
    for i in range(50, 1151):
        val = int(26 + (26-10) * (i - 50) / 1100)
        draw.line([(i, 50), (i, 580)], fill=(val, val, val + 10))
    
    draw.rounded_rectangle([50, 50, 1150, 580], radius=20, outline='#FF2D2D', width=2)
    
    try:
        fonts_to_try = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        ]
        title_font = None
        subtitle_font = None
        small_font = None
        emoji_font = None
        
        for font_path in fonts_to_try:
            if os.path.exists(font_path):
                title_font = ImageFont.truetype(font_path, 72)
                subtitle_font = ImageFont.truetype(font_path, 32)
                small_font = ImageFont.truetype(font_path, 24)
                emoji_font = ImageFont.truetype(font_path, 120)
                break
        
        if not title_font:
            title_font = ImageFont.load_default()
            subtitle_font = title_font
            small_font = title_font
            emoji_font = title_font
    except:
        title_font = ImageFont.load_default()
        subtitle_font = title_font
        small_font = title_font
        emoji_font = title_font
    
    draw.text((600, 200), emoji, font=emoji_font, fill='#FF2D2D', anchor='mm')
    draw.text((600, 360), title, font=title_font, fill='#ffffff', anchor='mm')
    draw.text((600, 450), subtitle, font=subtitle_font, fill='#a0a0a0', anchor='mm')
    draw.text((600, 540), domain, font=small_font, fill='#FF2D2D', anchor='mm')
    
    img.save(filename)
    print(f"Created {filename}")

create_og_image('og-image.png', 'LobstaCloud Admin', 'Admin dashboard', '⚙️', 'admin.redlobsta.com')

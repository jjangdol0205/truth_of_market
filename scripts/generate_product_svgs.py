import os

DEST_DIR = r"src\images\products"
os.makedirs(DEST_DIR, exist_ok=True)

# Helper for SVG header and styling
def wrap_svg(content, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <title>{title}</title>
  <defs>
    <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="ivory-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF8"/>
      <stop offset="100%" stop-color="#F3EFEA"/>
    </linearGradient>
    <linearGradient id="amber-glass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6E3A0E"/>
      <stop offset="35%" stop-color="#B86C26"/>
      <stop offset="70%" stop-color="#8C4A15"/>
      <stop offset="100%" stop-color="#4E2706"/>
    </linearGradient>
    <linearGradient id="amber-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFD494" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#FFD494" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="oil-drop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE885"/>
      <stop offset="100%" stop-color="#E5A912"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="24" fill="url(#ivory-bg)"/>
  <ellipse cx="200" cy="350" rx="140" ry="22" fill="#E2D9CF" opacity="0.6"/>
{content}
</svg>'''

svgs = {}

# 1. prod_nb_nut_1: Medical amber glass dropper bottle with pipette & probiotic sachet
svgs["prod_nb_nut_1"] = wrap_svg('''
  <!-- Probiotic Sachet -->
  <g transform="translate(220, 140) rotate(6)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="110" height="160" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <path d="M0,20 Q55,26 110,20" stroke="#CBD5E1" stroke-dasharray="3,3" fill="none"/>
    <circle cx="55" cy="55" r="18" fill="#EFF6FF"/>
    <path d="M47,55 L52,60 L63,48" stroke="#3B82F6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <text x="55" y="90" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" fill="#1E293B" text-anchor="middle">L. reuteri</text>
    <text x="55" y="105" font-family="-apple-system, sans-serif" font-size="9" fill="#64748B" text-anchor="middle">PROBIOTICS</text>
    <rect x="25" y="125" width="60" height="14" rx="7" fill="#E0F2FE"/>
    <text x="55" y="135" font-family="-apple-system, sans-serif" font-size="8" font-weight="600" fill="#0284C7" text-anchor="middle">100억 CFU</text>
  </g>

  <!-- Amber Dropper Bottle -->
  <g transform="translate(100, 110)" filter="url(#card-shadow)">
    <!-- Bottle Body -->
    <rect x="15" y="90" width="80" height="130" rx="16" fill="url(#amber-glass)"/>
    <rect x="22" y="94" width="14" height="122" rx="7" fill="url(#amber-highlight)"/>
    
    <!-- Bottle Neck & Cap -->
    <rect x="35" y="70" width="40" height="22" rx="4" fill="#3D1F05"/>
    <rect x="30" y="48" width="50" height="24" rx="4" fill="#1E293B"/>
    <!-- Rubber Bulb -->
    <path d="M42,48 C42,25 68,25 68,48 Z" fill="#0F172A"/>

    <!-- Dropper Pipette Pipette tube -->
    <g transform="translate(30, -30) rotate(-25)">
      <rect x="52" y="50" width="6" height="85" rx="3" fill="#E2E8F0" opacity="0.85"/>
      <path d="M52,135 L55,145 L58,135 Z" fill="#CBD5E1"/>
      <circle cx="55" cy="154" r="5" fill="url(#oil-drop)" filter="url(#soft-glow)"/>
      <line x1="53" y1="70" x2="57" y2="70" stroke="#0284C7" stroke-width="1"/>
      <line x1="53" y1="85" x2="57" y2="85" stroke="#0284C7" stroke-width="1"/>
      <line x1="53" y1="100" x2="57" y2="100" stroke="#0284C7" stroke-width="1"/>
    </g>

    <!-- Bottle Label -->
    <rect x="15" y="120" width="80" height="80" fill="#FAF5ED" stroke="#E5DEC9" stroke-width="0.5"/>
    <text x="55" y="140" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" fill="#854D0E" text-anchor="middle">BABY D3</text>
    <text x="55" y="153" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#0F172A" text-anchor="middle">400 IU</text>
    <text x="55" y="167" font-family="-apple-system, sans-serif" font-size="7" fill="#64748B" text-anchor="middle">닥터에디션</text>
    <circle cx="55" cy="182" r="5" fill="#EAB308"/>
  </g>
''', "닥터에디션 베이비 비타민D3 400IU 드롭스 &amp; 유산균")

# 2. prod_nb_dev_1: Accordion folding black/white focus book & sensory bunny doll
svgs["prod_nb_dev_1"] = wrap_svg('''
  <!-- Accordion Folding Board Book -->
  <g transform="translate(50, 110)" filter="url(#card-shadow)">
    <!-- Panel 1 (Facing left) -->
    <path d="M30,50 L90,30 L90,210 L30,230 Z" fill="#1E293B"/>
    <circle cx="60" cy="90" r="18" fill="#FFFFFF"/>
    <circle cx="60" cy="90" r="10" fill="#1E293B"/>
    <circle cx="60" cy="90" r="4" fill="#FFFFFF"/>
    <polygon points="45,150 75,135 75,175" fill="#FFFFFF"/>
    <polygon points="45,190 75,175 75,215" fill="#F8FAFC" opacity="0.9"/>

    <!-- Panel 2 (Facing right) -->
    <path d="M90,30 L150,50 L150,230 L90,210 Z" fill="#FFFFFF"/>
    <rect x="100" y="60" width="40" height="40" fill="#1E293B"/>
    <circle cx="120" cy="80" r="12" fill="#FFFFFF"/>
    <!-- Stripes -->
    <line x1="98" y1="130" x2="142" y2="130" stroke="#1E293B" stroke-width="6"/>
    <line x1="98" y1="150" x2="142" y2="150" stroke="#1E293B" stroke-width="6"/>
    <line x1="98" y1="170" x2="142" y2="170" stroke="#1E293B" stroke-width="6"/>
    <line x1="98" y1="190" x2="142" y2="190" stroke="#1E293B" stroke-width="6"/>

    <!-- Panel 3 (Color focus panel) -->
    <path d="M150,50 L205,32 L205,212 L150,230 Z" fill="#FEF08A"/>
    <circle cx="177" cy="85" r="16" fill="#EF4444"/>
    <polygon points="177,130 162,160 192,160" fill="#3B82F6"/>
    <rect x="165" y="175" width="24" height="24" rx="4" fill="#10B981"/>
  </g>

  <!-- Crinkle Sensory Bunny Doll -->
  <g transform="translate(230, 130)" filter="url(#card-shadow)">
    <!-- Ears -->
    <ellipse cx="40" cy="40" rx="12" ry="42" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" transform="rotate(-12, 40, 40)"/>
    <ellipse cx="40" cy="40" rx="6" ry="26" fill="#FCE7F3" transform="rotate(-12, 40, 40)"/>
    <ellipse cx="75" cy="40" rx="12" ry="42" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" transform="rotate(14, 75, 40)"/>
    <ellipse cx="75" cy="40" rx="6" ry="26" fill="#FCE7F3" transform="rotate(14, 75, 40)"/>
    <!-- Head -->
    <circle cx="58" cy="100" r="34" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <!-- Eyes & Nose -->
    <circle cx="48" cy="98" r="3" fill="#1E293B"/>
    <circle cx="68" cy="98" r="3" fill="#1E293B"/>
    <polygon points="58,104 55,108 61,108" fill="#F472B6"/>
    <path d="M55,111 Q58,114 61,111" stroke="#475569" stroke-width="1.5" fill="none"/>
    <ellipse cx="40" cy="106" rx="5" ry="3" fill="#FCE7F3"/>
    <ellipse cx="76" cy="106" rx="5" ry="3" fill="#FCE7F3"/>
    <!-- Body & Scarf -->
    <path d="M30,135 C30,125 86,125 86,135 L96,195 C96,205 20,205 20,195 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <path d="M36,130 Q58,138 80,130" stroke="#F43F5E" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- Arms -->
    <ellipse cx="22" cy="155" rx="8" ry="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" transform="rotate(20, 22, 155)"/>
    <ellipse cx="94" cy="155" rx="8" ry="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" transform="rotate(-20, 94, 155)"/>
  </g>
''', "신생아 흑백/컬러 초점책 &amp; 오감발달 헝겊 인형")

# 3. prod_nb_gear_1: Butterfly-wing swaddle wrap
svgs["prod_nb_gear_1"] = wrap_svg('''
  <g transform="translate(100, 60)" filter="url(#card-shadow)">
    <!-- Swaddle Butterfly Body -->
    <path d="M100,45 
             C120,45 130,55 140,75 
             C165,65 185,85 180,120 
             C175,145 150,150 140,155
             C155,200 160,250 150,285
             C140,315 60,315 50,285
             C40,250 45,200 60,155
             C50,150 25,145 20,120
             C15,85 35,65 60,75
             C70,55 80,45 100,45 Z" 
          fill="#FAF6EE" stroke="#E7DEC8" stroke-width="2.5"/>

    <!-- Wing stitch seams -->
    <path d="M60,75 Q90,95 70,150" stroke="#DDD1B8" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    <path d="M140,75 Q110,95 130,150" stroke="#DDD1B8" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    
    <!-- Neck Ribbing & Protective Flap -->
    <path d="M85,55 Q100,62 115,55" stroke="#D5C5A8" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="92" y="60" width="16" height="12" rx="3" fill="#FAF6EE" stroke="#DDD1B8" stroke-width="1"/>

    <!-- Two-way Zipper Line -->
    <line x1="100" y1="72" x2="100" y2="295" stroke="#C2B296" stroke-width="2" stroke-dasharray="2,2"/>
    <!-- Top Zipper Pull -->
    <rect x="97" y="78" width="6" height="10" rx="2" fill="#94A3B8"/>
    <!-- Bottom Zipper Pull -->
    <rect x="97" y="278" width="6" height="10" rx="2" fill="#94A3B8"/>

    <!-- Hip Healthy IHDI Badge -->
    <g transform="translate(75, 210)">
      <circle cx="25" cy="25" r="20" fill="#FFFFFF" stroke="#10B981" stroke-width="1.5"/>
      <path d="M16,25 L22,31 L34,19" stroke="#10B981" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="25" y="40" font-family="-apple-system, sans-serif" font-size="6" font-weight="700" fill="#047857" text-anchor="middle">IHDI 인체공학</text>
    </g>
  </g>
''', "모로반사 숙면 방지 오가닉 순면 스와들업 속싸개")

# 4. prod_nb_gear_2: 3D air-mesh pediatric pillow
svgs["prod_nb_gear_2"] = wrap_svg('''
  <g transform="translate(60, 100)" filter="url(#card-shadow)">
    <!-- Pillow Outer Pillow Shape -->
    <rect x="20" y="20" width="240" height="180" rx="60" fill="#F8FAFC" stroke="#A7F3D0" stroke-width="4"/>
    
    <!-- Honeycomb 3D Air Mesh Texture grid -->
    <g opacity="0.35" stroke="#94A3B8" stroke-width="1">
      <line x1="50" y1="50" x2="230" y2="50" stroke-dasharray="4,6"/>
      <line x1="40" y1="75" x2="240" y2="75" stroke-dasharray="4,6"/>
      <line x1="35" y1="100" x2="245" y2="100" stroke-dasharray="4,6"/>
      <line x1="35" y1="125" x2="245" y2="125" stroke-dasharray="4,6"/>
      <line x1="40" y1="150" x2="240" y2="150" stroke-dasharray="4,6"/>
      <line x1="50" y1="175" x2="230" y2="175" stroke-dasharray="4,6"/>
    </g>

    <!-- Center Concave Well for Newborn Cranial Protection -->
    <ellipse cx="140" cy="110" rx="48" ry="38" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2"/>
    <ellipse cx="140" cy="110" rx="36" ry="28" fill="#F1F5F9"/>
    <ellipse cx="140" cy="112" rx="20" ry="14" fill="#CBD5E1" opacity="0.6"/>

    <!-- Neck support curve zone -->
    <path d="M100,185 Q140,175 180,185" stroke="#34D399" stroke-width="3" stroke-linecap="round" fill="none"/>
    <text x="140" y="196" font-family="-apple-system, sans-serif" font-size="8" font-weight="600" fill="#059669" text-anchor="middle">0.5cm 경추 C자 지지대</text>

    <!-- Tag -->
    <rect x="235" y="130" width="22" height="12" rx="2" fill="#10B981"/>
    <text x="246" y="139" font-family="-apple-system, sans-serif" font-size="6" font-weight="700" fill="#FFFFFF" text-anchor="middle">AIR</text>
  </g>
''', "신생아 척추 보호 3D 통기성 에어메쉬 두상 베개")

# 5. prod_nb_learn_1: First sensory picture book & homeschool kit
svgs["prod_nb_learn_1"] = wrap_svg('''
  <!-- Gift Box in Background -->
  <g transform="translate(200, 90)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="140" height="180" rx="12" fill="#FAF5EF" stroke="#E8DFD3" stroke-width="2"/>
    <rect x="55" y="0" width="30" height="180" fill="#D97706" opacity="0.2"/>
    <rect x="0" y="75" width="140" height="30" fill="#D97706" opacity="0.2"/>
    <circle cx="70" cy="90" r="16" fill="#D97706"/>
    <text x="70" y="94" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle">웅진</text>
    <text x="70" y="135" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#78350F" text-anchor="middle">첫 그림책 키트</text>
    <rect x="35" y="145" width="70" height="16" rx="8" fill="#FDE68A"/>
    <text x="70" y="156" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#92400E" text-anchor="middle">0원 무료체험</text>
  </g>

  <!-- Open Hardcover Board Book in Foreground -->
  <g transform="translate(45, 150)" filter="url(#card-shadow)">
    <!-- Left Page -->
    <path d="M20,10 L105,2 L105,150 L20,165 Z" fill="#FEF9C3" stroke="#CBD5E1" stroke-width="1.5"/>
    <!-- Lion with fluffy mane -->
    <circle cx="62" cy="70" r="28" fill="#F59E0B"/>
    <circle cx="62" cy="70" r="22" fill="#FDE68A"/>
    <circle cx="54" cy="66" r="3" fill="#1E293B"/>
    <circle cx="70" cy="66" r="3" fill="#1E293B"/>
    <ellipse cx="62" cy="74" rx="4" ry="3" fill="#78350F"/>
    <rect x="35" y="115" width="55" height="12" rx="3" fill="#F59E0B" opacity="0.3"/>
    <text x="62" y="124" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#78350F" text-anchor="middle">어흥! 사자야</text>

    <!-- Right Page -->
    <path d="M105,2 L190,10 L190,165 L105,150 Z" fill="#E0F2FE" stroke="#CBD5E1" stroke-width="1.5"/>
    <!-- Elephant with tactile ear -->
    <ellipse cx="148" cy="75" rx="24" ry="20" fill="#94A3B8"/>
    <ellipse cx="164" cy="72" rx="14" ry="18" fill="#64748B"/> <!-- Touch fabric ear -->
    <path d="M132,78 Q125,86 128,95" stroke="#94A3B8" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="70" r="2.5" fill="#0F172A"/>
    <rect x="120" y="115" width="55" height="12" rx="3" fill="#0284C7" opacity="0.3"/>
    <text x="148" y="124" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#0369A1" text-anchor="middle">만져보아요 촉각</text>
  </g>
''', "웅진북클럽 베이비 첫 그림책 &amp; 홈스쿨링 무료체험")

# 6. prod_inf_nut_1: Chewable bear tablets & calcium zinc liquid sticks
svgs["prod_inf_nut_1"] = wrap_svg('''
  <!-- Product Box -->
  <g transform="translate(70, 90)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="150" height="210" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="0" y="0" width="150" height="40" rx="16" fill="#F0FDF4"/>
    <text x="75" y="25" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" fill="#15803D" text-anchor="middle">NUTRI BEAR 1~3세</text>
    <text x="75" y="65" font-family="-apple-system, sans-serif" font-size="13" font-weight="800" fill="#0F172A" text-anchor="middle">어린이 구연산 칼슘</text>
    <text x="75" y="82" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#3B82F6" text-anchor="middle">+ 비타민D3 &amp; 아연</text>
    
    <!-- Cartoon Bear graphic on box -->
    <circle cx="75" cy="125" r="26" fill="#FDBA74"/>
    <circle cx="56" cy="106" r="8" fill="#FDBA74"/>
    <circle cx="94" cy="106" r="8" fill="#FDBA74"/>
    <circle cx="68" cy="122" r="2.5" fill="#431407"/>
    <circle cx="82" cy="122" r="2.5" fill="#431407"/>
    <ellipse cx="75" cy="130" rx="4" ry="3" fill="#431407"/>

    <!-- Purity Seal Badge -->
    <circle cx="120" cy="175" r="20" fill="#FEF08A" stroke="#EAB308" stroke-width="1.5"/>
    <text x="120" y="174" font-family="-apple-system, sans-serif" font-size="6" font-weight="800" fill="#854D0E" text-anchor="middle">흡수율 1위</text>
    <text x="120" y="183" font-family="-apple-system, sans-serif" font-size="5" font-weight="700" fill="#A16207" text-anchor="middle">구연산칼슘</text>
  </g>

  <!-- Liquid Stick Pouch -->
  <g transform="translate(235, 120) rotate(8)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="40" height="170" rx="8" fill="#BAE6FD" stroke="#38BDF8" stroke-width="1.5"/>
    <path d="M0,15 L10,15" stroke="#0284C7" stroke-width="2"/>
    <text x="20" y="70" font-family="-apple-system, sans-serif" font-size="9" font-weight="700" fill="#0369A1" text-anchor="middle" transform="rotate(-90, 20, 70)">액상 칼슘 1포</text>
  </g>

  <!-- Chewable Bear Tablets -->
  <g transform="translate(195, 260)" filter="url(#card-shadow)">
    <!-- Bear 1 (Orange) -->
    <g transform="translate(0, 0)">
      <circle cx="16" cy="18" r="14" fill="#FB923C"/>
      <circle cx="6" cy="8" r="5" fill="#FB923C"/>
      <circle cx="26" cy="8" r="5" fill="#FB923C"/>
      <circle cx="12" cy="16" r="1.5" fill="#431407"/>
      <circle cx="20" cy="16" r="1.5" fill="#431407"/>
      <ellipse cx="16" cy="21" rx="2.5" ry="1.5" fill="#431407"/>
    </g>
    <!-- Bear 2 (Purple) -->
    <g transform="translate(35, 10)">
      <circle cx="16" cy="18" r="14" fill="#C084FC"/>
      <circle cx="6" cy="8" r="5" fill="#C084FC"/>
      <circle cx="26" cy="8" r="5" fill="#C084FC"/>
      <circle cx="12" cy="16" r="1.5" fill="#3B0764"/>
      <circle cx="20" cy="16" r="1.5" fill="#3B0764"/>
      <ellipse cx="16" cy="21" rx="2.5" ry="1.5" fill="#3B0764"/>
    </g>
  </g>
''', "어린이 구연산 칼슘 + 비타민D3 + 아연 츄어블/액상 시럽")

# 7. prod_inf_nut_2: ChildLife liquid calcium magnesium & orange slices
svgs["prod_inf_nut_2"] = wrap_svg('''
  <!-- Orange Slices -->
  <g transform="translate(60, 240)">
    <circle cx="60" cy="60" r="45" fill="#F97316"/>
    <circle cx="60" cy="60" r="40" fill="#FED7AA"/>
    <circle cx="60" cy="60" r="37" fill="#EA580C"/>
    <!-- Segments -->
    <path d="M60,60 L60,25 A35,35 0 0,1 85,35 Z" fill="#FDBA74"/>
    <path d="M60,60 L85,35 A35,35 0 0,1 95,60 Z" fill="#FDBA74"/>
    <path d="M60,60 L95,60 A35,35 0 0,1 85,85 Z" fill="#FDBA74"/>
    <path d="M60,60 L85,85 A35,35 0 0,1 60,95 Z" fill="#FDBA74"/>
    <path d="M60,60 L60,95 A35,35 0 0,1 35,85 Z" fill="#FDBA74"/>
    <path d="M60,60 L35,85 A35,35 0 0,1 25,60 Z" fill="#FDBA74"/>
    <path d="M60,60 L25,60 A35,35 0 0,1 35,35 Z" fill="#FDBA74"/>
    <path d="M60,60 L35,35 A35,35 0 0,1 60,25 Z" fill="#FDBA74"/>
  </g>

  <!-- Large Amber Bottle (ChildLife Style) -->
  <g transform="translate(140, 70)" filter="url(#card-shadow)">
    <!-- Bottle Body -->
    <rect x="20" y="80" width="105" height="175" rx="20" fill="url(#amber-glass)"/>
    <rect x="28" y="86" width="16" height="163" rx="8" fill="url(#amber-highlight)"/>
    <!-- Bottle Cap -->
    <rect x="52" y="45" width="42" height="35" rx="6" fill="#1E293B"/>

    <!-- Bottle Label -->
    <rect x="20" y="115" width="105" height="110" fill="#FFFBEB" stroke="#FDE68A" stroke-width="1"/>
    <rect x="20" y="125" width="105" height="18" fill="#1E3A8A"/>
    <text x="72" y="138" font-family="-apple-system, sans-serif" font-size="10" font-weight="800" fill="#FFFFFF" text-anchor="middle">ChildLife</text>
    <text x="72" y="162" font-family="-apple-system, sans-serif" font-size="11" font-weight="800" fill="#C2410C" text-anchor="middle">Liquid Calcium</text>
    <text x="72" y="176" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#1E293B" text-anchor="middle">with Magnesium</text>
    <text x="72" y="195" font-family="-apple-system, sans-serif" font-size="8" fill="#64748B" text-anchor="middle">Natural Orange Flavor</text>
    <text x="72" y="210" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#059669" text-anchor="middle">16 fl oz (473ml)</text>
  </g>

  <!-- Measuring Spoon with Creamy Orange Liquid -->
  <g transform="translate(235, 230)" filter="url(#card-shadow)">
    <!-- Clear Handle -->
    <rect x="40" y="30" width="60" height="12" rx="6" fill="#E2E8F0" opacity="0.8"/>
    <!-- Spoon Bowl -->
    <ellipse cx="30" cy="36" rx="28" ry="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <ellipse cx="30" cy="36" rx="23" ry="14" fill="#FED7AA"/>
    <ellipse cx="28" cy="35" rx="18" ry="10" fill="#FDBA74"/>
  </g>
''', "차일드라이프 액상 칼슘 마그네슘 &amp; 비타민D3")

# 8. prod_inf_dev_1: Montessori beechwood sorting cube & bead roller coaster
svgs["prod_inf_dev_1"] = wrap_svg('''
  <g transform="translate(90, 70)" filter="url(#card-shadow)">
    <!-- Roller Coaster Wires on Top -->
    <!-- Red Wire Loop -->
    <path d="M30,90 C10,10 60,-10 80,40 C100,90 150,10 180,90" fill="none" stroke="#F43F5E" stroke-width="4" stroke-linecap="round"/>
    <!-- Blue Wire Loop -->
    <path d="M45,90 C70,30 110,-5 140,40 C160,70 140,85 165,90" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
    <!-- Coaster Beads -->
    <circle cx="50" cy="30" r="10" fill="#FBBF24"/>
    <circle cx="100" cy="20" r="10" fill="#34D399"/>
    <circle cx="130" cy="25" r="10" fill="#A855F7"/>
    <circle cx="160" cy="55" r="10" fill="#FB923C"/>

    <!-- Wooden Cube Top Face (Isometric projection) -->
    <polygon points="110,80 200,110 110,140 20,110" fill="#F5E6CA" stroke="#D8C49E" stroke-width="2"/>
    <!-- Wooden Cube Left Face -->
    <polygon points="20,110 110,140 110,240 20,210" fill="#EAD4AF" stroke="#D8C49E" stroke-width="2"/>
    <!-- Shape Sorting Holes Left: Circle & Triangle -->
    <ellipse cx="65" cy="165" rx="14" ry="10" fill="#78350F" opacity="0.6"/>
    <polygon points="65,190 50,215 80,215" fill="#78350F" opacity="0.6"/>

    <!-- Wooden Cube Right Face -->
    <polygon points="110,140 200,110 200,210 110,240" fill="#DEBF93" stroke="#D8C49E" stroke-width="2"/>
    <!-- Shape Sorting Holes Right: Star & Square -->
    <polygon points="155,145 159,155 170,155 162,162 165,172 155,166 145,172 148,162 140,155 151,155" fill="#78350F" opacity="0.6"/>
    <polygon points="140,185 170,175 170,205 140,215" fill="#78350F" opacity="0.6"/>

    <!-- Scattered Sorting Blocks in front -->
    <!-- Yellow Triangle -->
    <polygon points="50,270 30,295 70,295" fill="#FBBF24" stroke="#D97706" stroke-width="1.5"/>
    <!-- Blue Circle/Cylinder -->
    <ellipse cx="110" cy="275" rx="15" ry="9" fill="#60A5FA"/>
    <rect x="95" y="275" width="30" height="15" fill="#3B82F6"/>
    <ellipse cx="110" cy="290" rx="15" ry="9" fill="#2563EB"/>
    <!-- Red Star Block -->
    <g transform="translate(160, 260) scale(1.2)">
      <polygon points="15,5 18,12 25,12 20,17 22,24 15,20 8,24 10,17 5,12 12,12" fill="#EF4444"/>
    </g>
  </g>
''', "몬테소리 소근육 발달 원목 도형 맞추기 &amp; 비즈 롤러코스터")

# 9. prod_inf_gear_1: Push walker & safety helmet
svgs["prod_inf_gear_1"] = wrap_svg('''
  <!-- Safety Cushion Helmet -->
  <g transform="translate(230, 160)" filter="url(#card-shadow)">
    <path d="M10,65 C10,25 90,25 90,65 C90,80 10,80 10,65 Z" fill="#BAE6FD" stroke="#38BDF8" stroke-width="2"/>
    <!-- Cushion rib grooves -->
    <path d="M30,35 Q30,65 30,75" stroke="#0284C7" stroke-width="2.5" fill="none"/>
    <path d="M50,28 Q50,65 50,78" stroke="#0284C7" stroke-width="2.5" fill="none"/>
    <path d="M70,35 Q70,65 70,75" stroke="#0284C7" stroke-width="2.5" fill="none"/>
    <!-- Chin strap -->
    <path d="M20,75 Q50,110 80,75" stroke="#0284C7" stroke-width="3" fill="none"/>
    <text x="50" y="55" font-family="-apple-system, sans-serif" font-size="7" font-weight="800" fill="#0369A1" text-anchor="middle">충격흡수 80g</text>
  </g>

  <!-- Baby Push Walker -->
  <g transform="translate(60, 80)" filter="url(#card-shadow)">
    <!-- Handlebar Frame -->
    <path d="M40,50 L40,160 L140,160 L140,50" stroke="#E2E8F0" stroke-width="8" stroke-linecap="round" fill="none"/>
    <rect x="35" y="42" width="110" height="14" rx="7" fill="#F59E0B"/>
    
    <!-- Main Activity Body Panel -->
    <rect x="25" y="90" width="130" height="135" rx="16" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
    
    <!-- Spinning Gears -->
    <circle cx="60" cy="130" r="18" fill="#F43F5E"/>
    <circle cx="60" cy="130" r="8" fill="#FFFFFF"/>
    <circle cx="92" cy="120" r="14" fill="#3B82F6"/>
    <circle cx="92" cy="120" r="6" fill="#FFFFFF"/>
    
    <!-- Mini Piano Keys -->
    <g transform="translate(45, 175)">
      <rect x="0" y="0" width="16" height="35" rx="3" fill="#EF4444"/>
      <rect x="18" y="0" width="16" height="35" rx="3" fill="#F59E0B"/>
      <rect x="36" y="0" width="16" height="35" rx="3" fill="#10B981"/>
      <rect x="54" y="0" width="16" height="35" rx="3" fill="#3B82F6"/>
      <rect x="72" y="0" width="16" height="35" rx="3" fill="#8B5CF6"/>
    </g>

    <!-- Speed-control Wheels -->
    <!-- Front Left Wheel -->
    <circle cx="20" cy="225" r="24" fill="#64748B" stroke="#334155" stroke-width="3"/>
    <circle cx="20" cy="225" r="10" fill="#F8FAFC"/>
    <!-- Front Right Wheel -->
    <circle cx="160" cy="225" r="24" fill="#64748B" stroke="#334155" stroke-width="3"/>
    <circle cx="160" cy="225" r="10" fill="#F8FAFC"/>
  </g>
''', "성장기 바른 보행 걸음마 학습기 &amp; 안전 헬멧")

# 10. prod_inf_learn_1: Interactive talking sound board book & guidance leaflet
svgs["prod_inf_learn_1"] = wrap_svg('''
  <!-- Guidance Leaflet in Background -->
  <g transform="translate(60, 110) rotate(-6)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="120" height="170" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="15" y="15" width="90" height="15" fill="#EEF2FF"/>
    <text x="60" y="26" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" fill="#4F46E5" text-anchor="middle">부모 언어자극 코칭 가이드</text>
    <line x1="20" y1="45" x2="100" y2="45" stroke="#94A3B8" stroke-width="2"/>
    <line x1="20" y1="60" x2="80" y2="60" stroke="#94A3B8" stroke-width="2"/>
    <line x1="20" y1="75" x2="95" y2="75" stroke="#94A3B8" stroke-width="2"/>
    <line x1="20" y1="90" x2="85" y2="90" stroke="#94A3B8" stroke-width="2"/>
    <rect x="25" y="120" width="70" height="24" rx="12" fill="#E0E7FF"/>
    <text x="60" y="135" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#3730A3" text-anchor="middle">1:1 언어발달 상담</text>
  </g>

  <!-- Sound Board Book -->
  <g transform="translate(150, 90)" filter="url(#card-shadow)">
    <!-- Book Body -->
    <rect x="0" y="0" width="180" height="210" rx="16" fill="#FEF3C7" stroke="#FDE68A" stroke-width="2"/>
    
    <!-- Illustration Area -->
    <rect x="15" y="15" width="150" height="100" rx="10" fill="#FFFFFF"/>
    <!-- Cute Car illustration -->
    <rect x="45" y="55" width="60" height="30" rx="8" fill="#F43F5E"/>
    <circle cx="60" cy="85" r="10" fill="#1E293B"/>
    <circle cx="90" cy="85" r="10" fill="#1E293B"/>
    <text x="90" y="42" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" fill="#1E293B" text-anchor="middle">부릉부릉 붕붕!</text>

    <!-- Sound Control Button Bar -->
    <g transform="translate(15, 125)">
      <!-- Sound buttons with icons -->
      <circle cx="20" cy="25" r="14" fill="#3B82F6"/>
      <text x="20" y="30" font-size="12" text-anchor="middle">🚗</text>
      <circle cx="55" cy="25" r="14" fill="#10B981"/>
      <text x="55" y="30" font-size="12" text-anchor="middle">🐶</text>
      <circle cx="90" cy="25" r="14" fill="#F59E0B"/>
      <text x="90" y="30" font-size="12" text-anchor="middle">🍎</text>
      <circle cx="125" cy="25" r="14" fill="#EC4899"/>
      <text x="125" y="30" font-size="12" text-anchor="middle">🎵</text>

      <!-- Speaker grille -->
      <g transform="translate(10, 55)" stroke="#D97706" stroke-width="1.5">
        <line x1="0" y1="0" x2="130" y2="0" stroke-dasharray="3,4"/>
        <line x1="0" y1="6" x2="130" y2="6" stroke-dasharray="3,4"/>
      </g>
    </g>
  </g>
''', "한솔교육 핀덴베베 말놀이·언어자극 그림책 체험팩")

# 11. prod_tod_nut_1: Golden yogurt probiotic stick box & zinc shield
svgs["prod_tod_nut_1"] = wrap_svg('''
  <!-- Probiotic Box in Gold -->
  <g transform="translate(100, 70)" filter="url(#card-shadow)">
    <defs>
      <linearGradient id="gold-box" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047"/>
        <stop offset="50%" stop-color="#EAB308"/>
        <stop offset="100%" stop-color="#CA8A04"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="160" height="220" rx="16" fill="url(#gold-box)" stroke="#A16207" stroke-width="1.5"/>
    <rect x="15" y="15" width="130" height="190" rx="10" fill="#FFFFFF"/>

    <text x="80" y="45" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" fill="#A16207" text-anchor="middle">키즈 면역 생유산균</text>
    <text x="80" y="65" font-family="-apple-system, sans-serif" font-size="16" font-weight="900" fill="#1E293B" text-anchor="middle">100억 CFU</text>
    <text x="80" y="82" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#D97706" text-anchor="middle">+ 아연 / 뉴질랜드 초유단백</text>

    <!-- Probiotic Capsule Burst Graphic -->
    <circle cx="80" cy="130" r="30" fill="#FEF08A" stroke="#EAB308" stroke-dasharray="3,3"/>
    <!-- Yogurt Swirl -->
    <path d="M60,135 Q80,105 100,135 Q80,150 60,135 Z" fill="#E0F2FE"/>

    <!-- Zinc Shield Emblem -->
    <g transform="translate(60, 160)">
      <path d="M20,0 L38,10 L38,25 C38,38 20,48 20,48 C20,48 2,38 2,25 L2,10 Z" fill="#EAB308" stroke="#A16207" stroke-width="1.5"/>
      <text x="20" y="28" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">Zn</text>
    </g>
  </g>

  <!-- Sachet Sticks lying in front -->
  <g transform="translate(60, 240) rotate(-15)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="120" height="32" rx="6" fill="#FEF08A" stroke="#EAB308" stroke-width="1"/>
    <text x="60" y="20" font-family="-apple-system, sans-serif" font-size="9" font-weight="800" fill="#854D0E" text-anchor="middle">이지컷 1일 1포 분유맛</text>
  </g>
''', "키즈 면역 생유산균 100억 CFU + 아연/초유 단백 성장단")

# 12. prod_tod_nut_2: SmartyPants multi gummies bottle
svgs["prod_tod_nut_2"] = wrap_svg('''
  <g transform="translate(120, 70)" filter="url(#card-shadow)">
    <!-- Clear Transparent Bottle -->
    <rect x="15" y="75" width="130" height="185" rx="24" fill="#F8FAFC" fill-opacity="0.85" stroke="#94A3B8" stroke-width="2"/>
    <rect x="50" y="40" width="60" height="35" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Gummy Bears visible through bottle -->
    <!-- Red Bear -->
    <ellipse cx="50" cy="190" rx="14" ry="18" fill="#EF4444"/>
    <circle cx="50" cy="165" r="10" fill="#EF4444"/>
    <!-- Yellow Bear -->
    <ellipse cx="80" cy="200" rx="14" ry="18" fill="#FBBF24"/>
    <circle cx="80" cy="175" r="10" fill="#FBBF24"/>
    <!-- Orange Bear -->
    <ellipse cx="110" cy="190" rx="14" ry="18" fill="#FB923C"/>
    <circle cx="110" cy="165" r="10" fill="#FB923C"/>

    <!-- Bottle Label -->
    <rect x="15" y="95" width="130" height="65" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <text x="80" y="115" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" fill="#3B82F6" text-anchor="middle">SmartyPants</text>
    <text x="80" y="130" font-family="-apple-system, sans-serif" font-size="10" font-weight="800" fill="#EF4444" text-anchor="middle">KIDS COMPLETE</text>
    <text x="80" y="145" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#10B981" text-anchor="middle">Daily Multi + Omega-3 DHA</text>
  </g>

  <!-- Gummy Bears spilled on table in front -->
  <g transform="translate(80, 275)" filter="url(#card-shadow)">
    <!-- Strawberry Bear -->
    <ellipse cx="30" cy="30" rx="12" ry="16" fill="#F43F5E"/>
    <circle cx="30" cy="12" r="8" fill="#F43F5E"/>
    <circle cx="24" cy="6" r="3.5" fill="#F43F5E"/>
    <circle cx="36" cy="6" r="3.5" fill="#F43F5E"/>
    <!-- Sugar crystal dots -->
    <circle cx="28" cy="25" r="1" fill="#FFFFFF"/>
    <circle cx="34" cy="28" r="1" fill="#FFFFFF"/>
    <circle cx="30" cy="35" r="1" fill="#FFFFFF"/>
    <!-- Lemon Bear -->
    <ellipse cx="65" cy="32" rx="12" ry="16" fill="#FACC15"/>
    <circle cx="65" cy="14" r="8" fill="#FACC15"/>
    <circle cx="59" cy="8" r="3.5" fill="#FACC15"/>
    <circle cx="71" cy="8" r="3.5" fill="#FACC15"/>
  </g>
''', "스마트팬츠 키즈 컴플리트 데일리 멀티구미")

# 13. prod_tod_dev_1: 3D rainbow magnetic tiles castle
svgs["prod_tod_dev_1"] = wrap_svg('''
  <g transform="translate(90, 60)" filter="url(#card-shadow)">
    <!-- Castle Central Spire -->
    <polygon points="110,20 80,80 140,80" fill="#EF4444" fill-opacity="0.8" stroke="#DC2626" stroke-width="1.5"/>
    <rect x="80" y="80" width="60" height="70" fill="#3B82F6" fill-opacity="0.75" stroke="#2563EB" stroke-width="1.5"/>
    <!-- Spire Window -->
    <rect x="98" y="95" width="24" height="35" rx="12" fill="#FEF08A" stroke="#CA8A04" stroke-width="1"/>

    <!-- Left Tower -->
    <polygon points="50,70 30,110 70,110" fill="#10B981" fill-opacity="0.8" stroke="#059669" stroke-width="1.5"/>
    <rect x="30" y="110" width="40" height="90" fill="#F59E0B" fill-opacity="0.75" stroke="#D97706" stroke-width="1.5"/>

    <!-- Right Tower -->
    <polygon points="170,70 150,110 190,110" fill="#8B5CF6" fill-opacity="0.8" stroke="#7C3AED" stroke-width="1.5"/>
    <rect x="150" y="110" width="40" height="90" fill="#EC4899" fill-opacity="0.75" stroke="#DB2777" stroke-width="1.5"/>

    <!-- Castle Base Main Wall -->
    <rect x="70" y="150" width="80" height="80" fill="#06B6D4" fill-opacity="0.75" stroke="#0891B2" stroke-width="1.5"/>
    <!-- Castle Gate Arched Doorway -->
    <path d="M92,230 L92,185 C92,175 128,175 128,185 L128,230 Z" fill="#F8FAFC" stroke="#0284C7" stroke-width="2"/>

    <!-- Magnetic Rivet Dots on Tiles -->
    <circle cx="85" cy="85" r="3" fill="#94A3B8"/>
    <circle cx="135" cy="85" r="3" fill="#94A3B8"/>
    <circle cx="85" cy="145" r="3" fill="#94A3B8"/>
    <circle cx="135" cy="145" r="3" fill="#94A3B8"/>
    <circle cx="35" cy="115" r="3" fill="#94A3B8"/>
    <circle cx="65" cy="115" r="3" fill="#94A3B8"/>
    <circle cx="155" cy="115" r="3" fill="#94A3B8"/>
    <circle cx="185" cy="115" r="3" fill="#94A3B8"/>

    <!-- Rainbow Floor Reflection Shadow -->
    <ellipse cx="110" cy="245" rx="85" ry="12" fill="#E0E7FF" opacity="0.6"/>
  </g>
''', "두뇌 공간지각력 발달 3D 입체 자석 마그네틱 블록 120P")

# 14. prod_tod_gear_1: Hexagonal silent bungee trampoline
svgs["prod_tod_gear_1"] = wrap_svg('''
  <g transform="translate(60, 80)" filter="url(#card-shadow)">
    <!-- Handlebar Post -->
    <path d="M140,50 L140,165" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
    <!-- Foam Grip Handlebar -->
    <rect x="90" y="42" width="100" height="16" rx="8" fill="#3B82F6"/>

    <!-- Hexagonal Trampoline Frame (Isometric 3D) -->
    <!-- Elastic Bungee Orange Loops around edge -->
    <polygon points="140,140 230,165 230,195 140,225 50,195 50,165" fill="#F97316" stroke="#EA580C" stroke-width="2"/>
    
    <!-- Black Jump Mat with Honeycomb Hexagon print -->
    <polygon points="140,148 218,170 218,190 140,215 62,190 62,170" fill="#0F172A"/>
    <polygon points="140,160 190,174 190,186 140,200 90,186 90,174" fill="none" stroke="#38BDF8" stroke-width="2"/>

    <!-- Steel Legs with Rubber Vibration Dampener Caps -->
    <!-- Leg 1 (Left) -->
    <rect x="52" y="195" width="8" height="55" rx="3" fill="#475569"/>
    <rect x="48" y="240" width="16" height="15" rx="4" fill="#0F172A"/>
    <!-- Leg 2 (Center Left) -->
    <rect x="95" y="210" width="8" height="55" rx="3" fill="#475569"/>
    <rect x="91" y="255" width="16" height="15" rx="4" fill="#0F172A"/>
    <!-- Leg 3 (Center Right) -->
    <rect x="175" y="210" width="8" height="55" rx="3" fill="#475569"/>
    <rect x="171" y="255" width="16" height="15" rx="4" fill="#0F172A"/>
    <!-- Leg 4 (Right) -->
    <rect x="220" y="195" width="8" height="55" rx="3" fill="#475569"/>
    <rect x="216" y="240" width="16" height="15" rx="4" fill="#0F172A"/>

    <text x="140" y="186" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" fill="#38BDF8" text-anchor="middle">무소음 번지코드</text>
  </g>
''', "어린이 성장판 수직 자극 무소음 번지코드 트램폴린")

# 15. prod_tod_learn_1: Pastel yellow AI tablet & workbooks
svgs["prod_tod_learn_1"] = wrap_svg('''
  <!-- Workbooks in Background -->
  <g transform="translate(180, 110)" filter="url(#card-shadow)">
    <rect x="0" y="20" width="140" height="160" rx="8" fill="#EC4899"/>
    <rect x="-10" y="10" width="140" height="160" rx="8" fill="#3B82F6"/>
    <rect x="-20" y="0" width="140" height="160" rx="8" fill="#10B981"/>
    <text x="50" y="45" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">밀크T 아이</text>
    <text x="50" y="65" font-family="-apple-system, sans-serif" font-size="10" font-weight="700" fill="#FEF08A" text-anchor="middle">한글·수학 놀이북</text>
  </g>

  <!-- Yellow Silicone Protective Tablet -->
  <g transform="translate(50, 90)" filter="url(#card-shadow)">
    <!-- Shockproof Silicone Bumper -->
    <rect x="0" y="0" width="180" height="145" rx="20" fill="#FDE047" stroke="#EAB308" stroke-width="3"/>
    <!-- Screen Bezel -->
    <rect x="15" y="15" width="150" height="115" rx="8" fill="#0F172A"/>
    <!-- Display Content -->
    <rect x="18" y="18" width="144" height="109" rx="6" fill="#F0FDF4"/>
    <text x="90" y="45" font-family="-apple-system, sans-serif" font-size="13" font-weight="900" fill="#15803D" text-anchor="middle">가 나 다 라</text>
    <circle cx="55" cy="78" r="16" fill="#FBBF24"/>
    <text x="55" y="83" font-size="16" text-anchor="middle">🦁</text>
    <circle cx="90" cy="78" r="16" fill="#60A5FA"/>
    <text x="90" y="83" font-size="16" text-anchor="middle">🚀</text>
    <circle cx="125" cy="78" r="16" fill="#F472B6"/>
    <text x="125" y="83" font-size="16" text-anchor="middle">🍎</text>
  </g>

  <!-- Chunky Stylus Pen -->
  <g transform="translate(190, 240) rotate(-35)" filter="url(#card-shadow)">
    <rect x="0" y="0" width="16" height="90" rx="8" fill="#3B82F6"/>
    <polygon points="0,90 16,90 8,110" fill="#F59E0B"/>
    <circle cx="8" cy="110" r="3" fill="#1E293B"/>
  </g>
''', "천재교육 밀크T 아이 유아 전과목 AI 학습기 7일 무료체험")

# 16. prod_ch_nut_1: Cobalt blue pediatric supplement & growth plate icon
svgs["prod_ch_nut_1"] = wrap_svg('''
  <g transform="translate(130, 70)" filter="url(#card-shadow)">
    <!-- Cobalt Blue Bottle Gradient -->
    <defs>
      <linearGradient id="cobalt-blue" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1E3A8A"/>
        <stop offset="40%" stop-color="#2563EB"/>
        <stop offset="70%" stop-color="#1D4ED8"/>
        <stop offset="100%" stop-color="#172554"/>
      </linearGradient>
    </defs>
    <!-- Bottle Body -->
    <rect x="15" y="75" width="115" height="180" rx="20" fill="url(#cobalt-blue)"/>
    <rect x="22" y="80" width="14" height="170" rx="7" fill="#93C5FD" opacity="0.35"/>
    <rect x="42" y="42" width="60" height="34" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Clinical Label -->
    <rect x="15" y="105" width="115" height="110" fill="#FFFFFF"/>
    <text x="72" y="125" font-family="-apple-system, sans-serif" font-size="11" font-weight="900" fill="#1E3A8A" text-anchor="middle">급성장기 청소년</text>
    <text x="72" y="140" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" fill="#0F172A" text-anchor="middle">CAL-MAG D3 K2</text>
    <text x="72" y="154" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#2563EB" text-anchor="middle">성장판 활성화 MK-7</text>

    <!-- Epiphyseal Growth Plate Line Emblem -->
    <g transform="translate(42, 162)">
      <!-- Long bone graphic -->
      <path d="M10,5 C10,0 20,0 20,5 L20,35 C20,40 10,40 10,35 Z" fill="#E2E8F0"/>
      <path d="M50,5 C50,0 40,0 40,5 L40,35 C40,40 50,40 50,35 Z" fill="#E2E8F0"/>
      <!-- Glowing Growth Plate Line -->
      <line x1="8" y1="20" x2="52" y2="20" stroke="#10B981" stroke-width="3" filter="url(#soft-glow)"/>
      <text x="30" y="32" font-family="-apple-system, sans-serif" font-size="6" font-weight="800" fill="#047857" text-anchor="middle">PHV 성장판</text>
    </g>
  </g>

  <!-- Chewable Tablets on Plate in Front -->
  <g transform="translate(85, 260)" filter="url(#card-shadow)">
    <circle cx="30" cy="30" r="16" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="30" y="34" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" fill="#64748B" text-anchor="middle">K2</text>
    <circle cx="55" cy="35" r="16" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="55" y="39" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" fill="#64748B" text-anchor="middle">Ca</text>
  </g>
''', "청소년 급성장기 고함량 칼슘마그네슘 D3 K2 츄어블정")

# 17. prod_ch_nut_2: Nordic Naturals blue bottle & softgels
svgs["prod_ch_nut_2"] = wrap_svg('''
  <g transform="translate(130, 65)" filter="url(#card-shadow)">
    <!-- Blue Bottle -->
    <rect x="15" y="75" width="115" height="185" rx="22" fill="#0284C7"/>
    <rect x="22" y="80" width="12" height="175" rx="6" fill="#7DD3FC" opacity="0.4"/>
    <rect x="42" y="42" width="60" height="34" rx="6" fill="#FFFFFF"/>

    <!-- Nordic Label -->
    <rect x="15" y="110" width="115" height="105" fill="#FFFFFF"/>
    <text x="72" y="130" font-family="-apple-system, sans-serif" font-size="11" font-weight="900" fill="#0369A1" text-anchor="middle">NORDIC NATURALS</text>
    <text x="72" y="148" font-family="-apple-system, sans-serif" font-size="13" font-weight="900" fill="#0F172A" text-anchor="middle">Daily Omega Kids</text>
    <text x="72" y="165" font-family="-apple-system, sans-serif" font-size="9" font-weight="700" fill="#F59E0B" text-anchor="middle">고순도 rTG DHA</text>

    <!-- Deep sea fish icon -->
    <path d="M50,185 Q72,175 94,185 Q72,195 50,185 Z" fill="#0284C7"/>
    <polygon points="50,185 40,178 40,192" fill="#0284C7"/>
  </g>

  <!-- Golden Softgel Capsules on Crystal Dish -->
  <g transform="translate(60, 245)" filter="url(#card-shadow)">
    <ellipse cx="60" cy="40" rx="45" ry="20" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
    <!-- Golden Softgels -->
    <ellipse cx="45" cy="38" rx="10" ry="6" fill="#F59E0B" filter="url(#soft-glow)"/>
    <ellipse cx="60" cy="34" rx="10" ry="6" fill="#F59E0B" filter="url(#soft-glow)"/>
    <ellipse cx="75" cy="39" rx="10" ry="6" fill="#F59E0B" filter="url(#soft-glow)"/>
    <ellipse cx="58" cy="44" rx="10" ry="6" fill="#EAB308" filter="url(#soft-glow)"/>
  </g>
''', "노르딕 네츄럴스 데일리 키즈 고순도 오메가3 DHA")

# 18. prod_ch_dev_1: GraviTrax kinetic marble run
svgs["prod_ch_dev_1"] = wrap_svg('''
  <g transform="translate(60, 60)" filter="url(#card-shadow)">
    <!-- Baseplate with hexagonal grid -->
    <polygon points="140,220 250,250 140,280 30,250" fill="#F1F5F9" stroke="#94A3B8" stroke-width="2"/>
    
    <!-- Transparent & Metallic Towers -->
    <!-- Tower 1 -->
    <rect x="60" y="120" width="20" height="130" fill="#CBD5E1"/>
    <!-- Tower 2 (High) -->
    <rect x="130" y="50" width="22" height="200" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1"/>
    <!-- Tower 3 -->
    <rect x="200" y="140" width="20" height="110" fill="#CBD5E1"/>

    <!-- Kinetic Rails (Metallic Chrome Curves) -->
    <!-- High Rail Loop -->
    <path d="M140,60 C220,70 230,130 140,150 C70,170 50,130 70,125" fill="none" stroke="#38BDF8" stroke-width="5" stroke-linecap="round"/>
    <!-- Spiral Track down -->
    <path d="M70,125 C120,135 220,160 210,190 C200,220 120,230 80,240" fill="none" stroke="#818CF8" stroke-width="5" stroke-linecap="round"/>

    <!-- Magnetic Cannon Component -->
    <rect x="110" y="142" width="30" height="16" rx="4" fill="#0F172A"/>
    <circle cx="125" cy="150" r="5" fill="#10B981"/>

    <!-- Shiny Chrome Metallic Marbles -->
    <circle cx="170" cy="85" r="9" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" filter="url(#soft-glow)"/>
    <circle cx="168" cy="82" r="3" fill="#FFFFFF"/>
    <circle cx="95" cy="180" r="9" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" filter="url(#soft-glow)"/>
    <circle cx="93" cy="177" r="3" fill="#FFFFFF"/>
    <circle cx="130" cy="235" r="9" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5" filter="url(#soft-glow)"/>
    <circle cx="128" cy="232" r="3" fill="#FFFFFF"/>
  </g>
''', "초등 과학탐구 전두엽 문제해결력 그래비트랙스 프로 스타터팩")

# 19. prod_ch_gear_1: Ergonomic chair & bamboo reading easel
svgs["prod_ch_gear_1"] = wrap_svg('''
  <!-- Ergonomic Pediatric Chair -->
  <g transform="translate(60, 70)" filter="url(#card-shadow)">
    <!-- Dual-wing Lumbar Backrest -->
    <g transform="translate(40, 20)">
      <!-- Left Wing -->
      <path d="M20,10 C5,10 0,35 0,65 C0,95 10,110 25,110 Z" fill="#6EE7B7" stroke="#059669" stroke-width="2"/>
      <!-- Right Wing -->
      <path d="M35,10 C50,10 55,35 55,65 C55,95 45,110 30,110 Z" fill="#6EE7B7" stroke="#059669" stroke-width="2"/>
      <!-- Spine adjustment bar -->
      <rect x="24" y="20" width="8" height="110" rx="4" fill="#334155"/>
    </g>

    <!-- Seat Cushion -->
    <ellipse cx="68" cy="145" rx="42" ry="18" fill="#10B981"/>

    <!-- Center Post Cylinder -->
    <rect x="64" y="160" width="8" height="60" fill="#64748B"/>

    <!-- Circular Footrest -->
    <ellipse cx="68" cy="195" rx="35" ry="12" fill="none" stroke="#334155" stroke-width="6"/>

    <!-- 5-Star Caster Base -->
    <path d="M68,220 L30,240 M68,220 L105,240 M68,220 L68,250" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
    <circle cx="30" cy="242" r="6" fill="#0F172A"/>
    <circle cx="105" cy="242" r="6" fill="#0F172A"/>
    <circle cx="68" cy="252" r="6" fill="#0F172A"/>
  </g>

  <!-- Bamboo Slant Reading Easel on Desk -->
  <g transform="translate(200, 110)" filter="url(#card-shadow)">
    <!-- Bamboo Board -->
    <polygon points="10,40 110,20 110,140 10,160" fill="#E6BA7E" stroke="#B4823A" stroke-width="2"/>
    <!-- Wood grain lines -->
    <line x1="20" y1="50" x2="100" y2="35" stroke="#C89758" stroke-width="1.5"/>
    <line x1="20" y1="90" x2="100" y2="75" stroke="#C89758" stroke-width="1.5"/>
    <line x1="20" y1="130" x2="100" y2="115" stroke="#C89758" stroke-width="1.5"/>
    
    <!-- Open Book on Easel -->
    <polygon points="25,60 95,45 95,135 25,150" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <!-- Page holder clips -->
    <rect x="25" y="145" width="8" height="15" rx="3" fill="#64748B"/>
    <rect x="85" y="132" width="8" height="15" rx="3" fill="#64748B"/>

    <text x="60" y="185" font-family="-apple-system, sans-serif" font-size="8" font-weight="800" fill="#78350F" text-anchor="middle">바른자세 각도 독서대</text>
  </g>
''', "초등학생 인체공학 척추 지지 성장 의자 &amp; 독서대")

# 20. prod_ch_learn_1: Smart dual-screen AI learning tablet & stylus
svgs["prod_ch_learn_1"] = wrap_svg('''
  <!-- Stack of Elementary Diagnostic Workbooks -->
  <g transform="translate(70, 150)" filter="url(#card-shadow)">
    <rect x="0" y="40" width="130" height="90" rx="6" fill="#EC4899"/>
    <rect x="5" y="20" width="130" height="90" rx="6" fill="#3B82F6"/>
    <rect x="10" y="0" width="130" height="90" rx="6" fill="#10B981"/>
    <text x="75" y="30" font-family="-apple-system, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">아이스크림 홈런</text>
    <text x="75" y="48" font-family="-apple-system, sans-serif" font-size="9" font-weight="700" fill="#FEF08A" text-anchor="middle">초등 전과목 진단평가</text>
  </g>

  <!-- Cone-shaped Stand & Dual-Screen Tablet -->
  <g transform="translate(180, 80)" filter="url(#card-shadow)">
    <!-- Cone Pedestal Stand -->
    <path d="M40,190 L90,190 L75,130 L55,130 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
    <ellipse cx="65" cy="190" rx="35" ry="10" fill="#E2E8F0"/>

    <!-- Upper Main Screen -->
    <rect x="0" y="20" width="130" height="85" rx="10" fill="#0F172A"/>
    <rect x="6" y="26" width="118" height="73" rx="6" fill="#EEF2FF"/>
    <text x="65" y="55" font-family="-apple-system, sans-serif" font-size="10" font-weight="900" fill="#4338CA" text-anchor="middle">AI 1:1 맞춤 학습관</text>
    <rect x="25" y="65" width="80" height="16" rx="8" fill="#4F46E5"/>
    <text x="65" y="76" font-family="-apple-system, sans-serif" font-size="8" font-weight="700" fill="#FFFFFF" text-anchor="middle">10일 무료체험 시작</text>

    <!-- Lower Secondary Touch Screen (Angled) -->
    <polygon points="5,110 125,110 115,145 15,145" fill="#1E293B"/>
    <polygon points="12,114 118,114 110,140 20,140" fill="#FEF9C3"/>
    <text x="65" y="130" font-family="-apple-system, sans-serif" font-size="7" font-weight="800" fill="#854D0E" text-anchor="middle">디지털 터치 필기 패드</text>

    <!-- Smart Stylus Pen resting beside -->
    <g transform="translate(135, 60) rotate(15)">
      <rect x="0" y="0" width="6" height="80" rx="3" fill="#E2E8F0"/>
      <polygon points="0,80 6,80 3,92" fill="#0F172A"/>
    </g>
  </g>
''', "아이스크림 홈런 초등 전과목 AI 학습 10일 무료체험")

for pid, content in svgs.items():
    file_path = os.path.join(DEST_DIR, f"{pid}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Generated {len(svgs)} SVGs in {DEST_DIR}")

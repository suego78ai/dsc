/**
 * 디지털새싹 현수막 생성기 - Core Application Logic (With Custom Image & Directory Uploads)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const form = document.getElementById('generator-form');
  const canvas = document.getElementById('banner-canvas');
  const ctx = canvas.getContext('2d');
  
  const titleInput = document.getElementById('banner-title');
  const subtitleInput = document.getElementById('banner-subtitle');
  const dateInput = document.getElementById('event-date');
  const locationInput = document.getElementById('event-location');
  const organizerInput = document.getElementById('event-organizer');
  
  const targetRadios = document.querySelectorAll('input[name="target-audience"]');
  const ratioRadios = document.querySelectorAll('input[name="banner-ratio"]');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const downloadBtn = document.getElementById('download-jpg-btn');

  // File Upload Elements
  const bgUploadModes = document.querySelectorAll('input[name="bg-upload-mode"]');
  const bgFileWrapper = document.getElementById('bg-file-wrapper');
  const bgFolderWrapper = document.getElementById('bg-folder-wrapper');
  const uploadBgInput = document.getElementById('upload-bg');
  const uploadBgFolderInput = document.getElementById('upload-bg-folder');
  const rerollBgBtn = document.getElementById('reroll-bg-btn');
  const resetBgBtn = document.getElementById('reset-bg-btn');
  const bgUploadStatus = document.getElementById('bg-upload-status');
  
  const uploadCharInput = document.getElementById('upload-char');
  const resetCharBtn = document.getElementById('reset-char-btn');

  // --- Configuration & Constants ---
  const THEME_MAP = {
    green: {
      id: 'green',
      isDark: false,
      bgGradient: ['#E6F4EA', '#F4FAF6', '#FFFDF5'], // Rich 3-stop fresh mint to warm yellow
      titleColor: '#064E3B',
      subtitleColor: '#059669',
      detailsBg: 'rgba(16, 185, 129, 0.09)',
      detailsBorder: 'rgba(16, 185, 129, 0.22)',
      detailsTextColor: '#1E293B',
      detailsAccentColor: '#059669',
      badgeBg: '#D1FAE5',
      badgeTextColor: '#065F46',
      decorColor1: 'rgba(16, 185, 129, 0.18)',
      decorColor2: 'rgba(251, 191, 36, 0.28)',
      sproutColors: ['#10B981', '#FBBF24'] // Emerald, Amber
    },
    blue: {
      id: 'blue',
      isDark: false,
      bgGradient: ['#E5F0FD', '#F1F6FC', '#F8FAFC'], // Smart tech-blue gradient
      titleColor: '#1E3A8A',
      subtitleColor: '#2563EB',
      detailsBg: 'rgba(37, 99, 235, 0.08)',
      detailsBorder: 'rgba(37, 99, 235, 0.18)',
      detailsTextColor: '#1E293B',
      detailsAccentColor: '#2563EB',
      badgeBg: '#DBEAFE',
      badgeTextColor: '#1E40AF',
      decorColor1: 'rgba(59, 130, 246, 0.18)',
      decorColor2: 'rgba(6, 182, 212, 0.22)',
      sproutColors: ['#3B82F6', '#06B6D4'] // Blue, Cyan
    },
    purple: {
      id: 'purple',
      isDark: true,
      bgGradient: ['#060913', '#0F122B', '#1C153E'], // Deep night-sky space violet
      titleColor: '#FFFFFF',
      subtitleColor: '#C084FC',
      detailsBg: 'rgba(139, 92, 246, 0.14)',
      detailsBorder: 'rgba(139, 92, 246, 0.32)',
      detailsTextColor: '#E5E7EB',
      detailsAccentColor: '#A78BFA',
      badgeBg: 'rgba(139, 92, 246, 0.3)',
      badgeTextColor: '#F3F4F6',
      decorColor1: 'rgba(139, 92, 246, 0.28)',
      decorColor2: 'rgba(236, 72, 153, 0.28)',
      sproutColors: ['#8B5CF6', '#EC4899'] // Purple, Pink
    },
    sunset: {
      id: 'sunset',
      isDark: false,
      bgGradient: ['#FFF2ED', '#FFFBF9', '#FFF0E6'], // Warm soft orange-coral gradient
      titleColor: '#7C2D12',
      subtitleColor: '#EA580C',
      detailsBg: 'rgba(249, 115, 22, 0.08)',
      detailsBorder: 'rgba(249, 115, 22, 0.2)',
      detailsTextColor: '#1E293B',
      detailsAccentColor: '#EA580C',
      badgeBg: '#FFEDD5',
      badgeTextColor: '#9A3412',
      decorColor1: 'rgba(249, 115, 22, 0.18)',
      decorColor2: 'rgba(239, 68, 68, 0.18)',
      sproutColors: ['#F97316', '#EF4444'] // Orange, Red
    },
    cyber: {
      id: 'cyber',
      isDark: true,
      bgGradient: ['#01040A', '#061324', '#0A203A'], // Deep neon cyber space
      titleColor: '#FFFFFF',
      subtitleColor: '#00F5FF', // Neon Cyan
      detailsBg: 'rgba(6, 214, 160, 0.14)', // Emerald tint
      detailsBorder: 'rgba(6, 214, 160, 0.35)',
      detailsTextColor: '#E2E8F0',
      detailsAccentColor: '#06D6A0', // Neon Emerald
      badgeBg: 'rgba(6, 214, 160, 0.28)',
      badgeTextColor: '#FFFFFF',
      decorColor1: 'rgba(6, 214, 160, 0.22)',
      decorColor2: 'rgba(0, 245, 255, 0.25)',
      sproutColors: ['#06D6A0', '#00F5FF'] // Emerald, Cyan
    }
  };

  // Default target-to-theme mapping for "auto" theme
  const AUTO_THEME_MAP = {
    elementary: 'green',
    middle: 'blue',
    high: 'purple',
    all: 'sunset'
  };

  // Image Resource Paths
  const imgResources = {
    logo: 'image/[붙임2] 디지털새싹 BI/디지털새싹_png.png',
    moe: '[붙임4] 교육부 MI.png',
    kofac: '[붙임5] 한국과학창의재단 CI.jpg',
    char_elementary: 'image/[붙임3] 누룽찌 캐릭터/응용동작 10종/마우스와춤을.png',
    char_middle: 'image/[붙임3] 누룽찌 캐릭터/응용동작 10종/마우스클릭.png',
    char_high: 'image/[붙임3] 누룽찌 캐릭터/응용동작 10종/키보드연타.png',
    char_all: 'image/[붙임3] 누룽찌 캐릭터/응용동작 10종/응원.png',
    char_side: 'image/[붙임3] 누룽찌 캐릭터/응용동작 10종/촉이왔다.png'
  };

  // Preloaded Images Storage
  const loadedImages = {};
  let totalResources = Object.keys(imgResources).length;
  let loadedResourcesCount = 0;

  // Custom Uploaded Image States
  let uploadedBgImage = null;
  let uploadedSingleBgFile = null;
  let currentBgFileName = '';
  let uploadedCharImage = null;
  
  // Custom Folder Upload State (For Random selection)
  let uploadedBgFolderFiles = [];

  // State Variables
  let currentThemeKey = 'auto';
  let activeTheme = THEME_MAP.green; // Resolved theme

  // --- Image Resource Preloader ---
  function loadResources(callback) {
    for (const [key, src] of Object.entries(imgResources)) {
      const img = new Image();
      img.onload = () => {
        loadedImages[key] = img;
        loadedResourcesCount++;
        if (loadedResourcesCount === totalResources) {
          callback();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load resource: ${src}`);
        loadedResourcesCount++; // Continue even if load fails to not lock app
        if (loadedResourcesCount === totalResources) {
          callback();
        }
      };
      img.src = src;
    }
  }

  // --- Helper Functions ---

  // Get selected values from radio inputs
  function getSelectedRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : null;
  }

  // Update target card active styling
  function updateTargetCardStyles() {
    targetRadios.forEach(radio => {
      const card = radio.closest('.target-card');
      if (radio.checked) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // Update aspect ratio button active styling
  function updateRatioStyles() {
    ratioRadios.forEach(radio => {
      const btn = radio.closest('.ratio-btn');
      if (radio.checked) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Resolve current active theme object based on selections
  function resolveTheme() {
    if (currentThemeKey === 'auto') {
      const target = getSelectedRadioValue('target-audience');
      const mappedThemeKey = AUTO_THEME_MAP[target] || 'green';
      activeTheme = THEME_MAP[mappedThemeKey];
    } else {
      activeTheme = THEME_MAP[currentThemeKey];
    }
  }

  // Helper to parse RGBA and set custom alpha channel safely
  function setAlpha(rgbaStr, newAlpha) {
    const match = rgbaStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${newAlpha})`;
    }
    return rgbaStr;
  }

  // Draw stylized leaf with gradient, vein, and border
  function drawPremiumLeaf(ctx, x, y, scale, angle, color1, color2) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-15, -15, -10, -35);
    ctx.quadraticCurveTo(0, -45, 10, -35);
    ctx.quadraticCurveTo(15, -15, 0, 0);
    ctx.closePath();
    
    const leafGrad = ctx.createLinearGradient(-10, -35, 10, 0);
    leafGrad.addColorStop(0, color1);
    leafGrad.addColorStop(1, color2);
    ctx.fillStyle = leafGrad;
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0, -20, 0, -35);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    
    ctx.restore();
  }

  // Draw organic growing sprout branch with digital details
  function drawSproutBranch(ctx, startX, startY, height, direction, theme) {
    ctx.save();
    
    const c1 = theme.sproutColors[0];
    const c2 = theme.sproutColors[1] || theme.sproutColors[0];
    
    // Stem bezier curve path
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    const cp1x = startX + 120 * direction;
    const cp1y = startY - height * 0.3;
    const cp2x = startX - 60 * direction;
    const cp2y = startY - height * 0.7;
    const endX = startX + 60 * direction;
    const endY = startY - height;
    
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    
    const stemGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    stemGrad.addColorStop(0, theme.decorColor1);
    stemGrad.addColorStop(1, c1);
    
    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw leaves at points along the stem
    const p1x = startX + (cp1x - startX) * 0.4;
    const p1y = startY - height * 0.25;
    drawPremiumLeaf(ctx, p1x, p1y, 0.7, direction * -Math.PI / 4, c1, c2);
    
    const p2x = cp2x + (endX - cp2x) * 0.3;
    const p2y = startY - height * 0.6;
    drawPremiumLeaf(ctx, p2x, p2y, 0.9, direction * Math.PI / 3, c1, c2);
    
    // Top sprout double leaves
    drawPremiumLeaf(ctx, endX, endY, 1.15, direction * -Math.PI / 8, c1, c2);
    drawPremiumLeaf(ctx, endX - 6 * direction, endY - 6, 0.85, direction * Math.PI / 6, c2, c1);
    
    // Digital node on tip
    ctx.beginPath();
    ctx.arc(endX, endY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = c1;
    ctx.shadowBlur = 12;
    ctx.fill();
    
    ctx.restore();
  }

  // --- Target-Specific Drawing Helpers ---

  // Draw cute computer with eyes and smile (Elementary)
  function drawCuteComputer(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Screen border
    ctx.strokeRect(x - size/2, y - size*0.4, size, size * 0.7);
    
    // Stand
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15, y + size * 0.3);
    ctx.lineTo(x - size * 0.15, y + size * 0.48);
    ctx.lineTo(x + size * 0.15, y + size * 0.48);
    ctx.lineTo(x + size * 0.15, y + size * 0.3);
    ctx.stroke();
    
    // Base
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y + size * 0.48);
    ctx.lineTo(x + size * 0.35, y + size * 0.48);
    ctx.stroke();

    // Cute Face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - size * 0.18, y - size * 0.12, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.18, y - size * 0.12, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.beginPath();
    ctx.arc(x, y + size * 0.02, size * 0.1, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Draw a technical gear outline (Middle School)
  function drawGear(ctx, x, y, radius, teeth, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = radius * 0.14;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    const outerRadius = radius;
    const innerRadius = radius * 0.75;
    
    for (let i = 0; i < teeth; i++) {
      const angle = (i * 2 * Math.PI) / teeth;
      const angleTooth1 = ((i + 0.25) * 2 * Math.PI) / teeth;
      const angleTooth2 = ((i + 0.55) * 2 * Math.PI) / teeth;
      const angleNext = ((i + 0.8) * 2 * Math.PI) / teeth;
      
      ctx.lineTo(x + Math.cos(angle) * innerRadius, y + Math.sin(angle) * innerRadius);
      ctx.lineTo(x + Math.cos(angleTooth1) * outerRadius, y + Math.sin(angleTooth1) * outerRadius);
      ctx.lineTo(x + Math.cos(angleTooth2) * outerRadius, y + Math.sin(angleTooth2) * outerRadius);
      ctx.lineTo(x + Math.cos(angleNext) * innerRadius, y + Math.sin(angleNext) * innerRadius);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Inner center circle ring
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw AI Neural Network mesh (High School)
  function drawNeuralNetwork(ctx, x, y, w, h, color, accentColor) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    
    // Node relative placements
    const nodes = [
      {rx: 0.1, ry: 0.3},
      {rx: 0.35, ry: 0.15},
      {rx: 0.3, ry: 0.65},
      {rx: 0.6, ry: 0.35},
      {rx: 0.85, ry: 0.2},
      {rx: 0.8, ry: 0.7}
    ];
    
    const absoluteNodes = nodes.map(n => ({
      x: x + n.rx * w,
      y: y + n.ry * h
    }));
    
    // Node connections
    const connections = [
      [0, 1], [0, 2],
      [1, 3], [2, 3],
      [3, 4], [3, 5],
      [1, 4], [2, 5]
    ];
    
    connections.forEach(pair => {
      ctx.beginPath();
      ctx.moveTo(absoluteNodes[pair[0]].x, absoluteNodes[pair[0]].y);
      ctx.lineTo(absoluteNodes[pair[1]].x, absoluteNodes[pair[1]].y);
      ctx.stroke();
    });
    
    // Draw dots & circles
    absoluteNodes.forEach((node, idx) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = idx % 2 === 0 ? color : accentColor;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? color : accentColor;
      ctx.stroke();
    });
    
    ctx.restore();
  }

  // Draw floating binary code text block (High School / Tech)
  function drawBinaryText(ctx, x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = '500 24px Courier, monospace';
    ctx.fillText('01000100 01001001', x, y);
    ctx.fillText('01000111 01001001', x, y + 35);
    ctx.fillText('01010100 01000001', x, y + 70);
    ctx.fillText('01001100 01010011', x, y + 105);
    ctx.restore();
  }

  // Draw decorative vector sprout (used as mascot fallback)
  function drawSprout(ctx, x, y, size, angle, colors) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Stem
    ctx.beginPath();
    ctx.moveTo(0, size * 0.8);
    ctx.bezierCurveTo(0, size * 0.2, -size * 0.2, 0, 0, -size * 0.4);
    ctx.lineWidth = size * 0.08;
    ctx.strokeStyle = colors[0];
    ctx.lineCap = 'round';
    ctx.stroke();

    // Leaf 1
    ctx.save();
    ctx.translate(0, -size * 0.1);
    ctx.rotate(-Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.4, -size * 0.1, -size * 0.3, -size * 0.4);
    ctx.quadraticCurveTo(-size * 0.1, -size * 0.3, 0, 0);
    const grad1 = ctx.createLinearGradient(-size * 0.3, -size * 0.4, 0, 0);
    grad1.addColorStop(0, colors[0]);
    grad1.addColorStop(1, colors[1]);
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.restore();

    // Leaf 2
    ctx.save();
    ctx.translate(0, -size * 0.1);
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.4, -size * 0.1, size * 0.3, -size * 0.4);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.3, 0, 0);
    const grad2 = ctx.createLinearGradient(size * 0.3, -size * 0.4, 0, 0);
    grad2.addColorStop(0, colors[1]);
    grad2.addColorStop(1, colors[0]);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Draw 4-pointed glowing stars/sparkles
  function drawSparkle(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.fillStyle = color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
  }

  // Draw a calendar icon
  function drawCalendarIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeRect(x, y + size * 0.15, size, size * 0.8);
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.4);
    ctx.lineTo(x + size, y + size * 0.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + size * 0.25, y);
    ctx.lineTo(x + size * 0.25, y + size * 0.25);
    ctx.moveTo(x + size * 0.75, y);
    ctx.lineTo(x + size * 0.75, y + size * 0.25);
    ctx.stroke();

    ctx.fillStyle = color;
    const dotSize = size * 0.08;
    ctx.fillRect(x + size * 0.25 - dotSize/2, y + size * 0.6 - dotSize/2, dotSize, dotSize);
    ctx.fillRect(x + size * 0.5 - dotSize/2, y + size * 0.6 - dotSize/2, dotSize, dotSize);
    ctx.fillRect(x + size * 0.75 - dotSize/2, y + size * 0.6 - dotSize/2, dotSize, dotSize);
    ctx.fillRect(x + size * 0.25 - dotSize/2, y + size * 0.8 - dotSize/2, dotSize, dotSize);
    ctx.fillRect(x + size * 0.5 - dotSize/2, y + size * 0.8 - dotSize/2, dotSize, dotSize);
    ctx.fillRect(x + size * 0.75 - dotSize/2, y + size * 0.8 - dotSize/2, dotSize, dotSize);

    ctx.restore();
  }

  // Draw a location pin icon
  function drawLocationIcon(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const cx = x + size/2;
    const cy = y + size*0.35;
    const r = size * 0.35;
    ctx.arc(cx, cy, r, -Math.PI * 0.1, -Math.PI * 0.9, true);
    ctx.lineTo(cx, y + size);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }

  // --- Image Resource Drawing Methods ---

  // Draw Program Brand Logo dynamically
  function drawProgramLogo(ctx, x, y, height) {
    const logo = loadedImages.logo;
    if (logo) {
      ctx.save();
      const ratio = logo.width / logo.height;
      const width = height * ratio;
      ctx.drawImage(logo, x, y, width, height);
      ctx.restore();
      return width;
    }
    return 0;
  }

  // Draw Sponsor logos wrapped in a beautiful white rounded pill background card
  function drawSponsors(ctx, x, y, height) {
    ctx.save();
    
    const moe = loadedImages.moe;
    const kofac = loadedImages.kofac;
    
    // Default fallback widths if not loaded
    let moeW = moe ? (height - 20) * (moe.width / moe.height) : 150;
    let kofacW = kofac ? (height - 20) * (kofac.width / kofac.height) : 170;
    
    const padding = 22;
    const gap = 24;
    const totalW = padding * 2 + moeW + gap + kofacW;
    
    // Draw white container pill
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.roundRect(x, y, totalW, height, height / 2);
    ctx.fill();
    ctx.shadowColor = 'transparent'; // Reset shadow
    
    // Draw Ministry of Education (MOE)
    if (moe) {
      ctx.drawImage(moe, x + padding, y + 10, moeW, height - 20);
    }
    
    // Draw Korea Foundation for Advancement of Science & Creativity (KOFAC)
    if (kofac) {
      ctx.drawImage(kofac, x + padding + moeW + gap, y + 10, kofacW, height - 20);
    }
    
    ctx.restore();
    return totalW;
  }

  // Draw Nurungzzi Mascot dynamically based on target group (or custom uploaded character image)
  function drawMascot(ctx, targetAudience, x, y, height, isSide = false) {
    // If a custom character is uploaded, use it for the main mascot (not isSide)
    if (!isSide && uploadedCharImage) {
      ctx.save();
      const ratio = uploadedCharImage.width / uploadedCharImage.height;
      const width = height * ratio;
      
      // Draw with soft drop shadow for premium depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(uploadedCharImage, x - width/2, y - height/2, width, height);
      ctx.restore();
      return width;
    }
    
    let imgKey = 'char_all';
    if (isSide) {
      imgKey = 'char_side';
    } else {
      if (targetAudience === 'elementary') imgKey = 'char_elementary';
      else if (targetAudience === 'middle') imgKey = 'char_middle';
      else if (targetAudience === 'high') imgKey = 'char_high';
    }
    
    const img = loadedImages[imgKey];
    if (img) {
      ctx.save();
      const ratio = img.width / img.height;
      const width = height * ratio;
      
      // Draw with soft drop shadow for premium depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(img, x - width/2, y - height/2, width, height);
      ctx.restore();
      return width;
    } else {
      // Fallback: draw our nice vector sprout if image is not loaded yet
      drawSprout(ctx, x, y, height * 0.4, 0, activeTheme.sproutColors);
      return height;
    }
  }

  // Draw beautiful background decorations based on theme, target, and canvas size
  function drawBackgroundDecorations(ctx, width, height, theme, targetAudience) {
    ctx.save();

    // 1. Draw glowing background bokeh orbs
    const bokehs = [
      { rx: 0.15, ry: 0.3, r: 80 },
      { rx: 0.35, ry: 0.7, r: 120 },
      { rx: 0.55, ry: 0.2, r: 90 },
      { rx: 0.75, ry: 0.4, r: 150 },
      { rx: 0.9, ry: 0.8, r: 100 },
      { rx: 0.05, ry: 0.8, r: 60 },
      { rx: 0.45, ry: 0.5, r: 70 },
      { rx: 0.82, ry: 0.15, r: 110 }
    ];

    bokehs.forEach(b => {
      const bx = b.rx * width;
      const by = b.ry * height;
      const br = b.r * (height / 600); // Scale with height
      
      ctx.save();
      const bokehGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      bokehGrad.addColorStop(0, setAlpha(theme.decorColor1, 0.12));
      bokehGrad.addColorStop(0.5, setAlpha(theme.decorColor2, 0.04));
      bokehGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = bokehGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 2. Draw Digital Tech Grid/Lines (Tech-organic blend)
    ctx.strokeStyle = setAlpha(theme.decorColor1, 0.25);
    ctx.lineWidth = 1.5;
    const gridCols = [0.08, 0.25, 0.48, 0.62, 0.78, 0.92];
    gridCols.forEach(col => {
      const gx = col * width;
      const gyStart = height;
      const gyEnd = height * (0.2 + 0.3 * Math.sin(col * 10)); // Variable heights
      
      ctx.beginPath();
      ctx.moveTo(gx, gyStart);
      ctx.lineTo(gx, gyEnd);
      ctx.stroke();
      
      // Draw grid nodes
      ctx.beginPath();
      ctx.arc(gx, gyEnd, 4, 0, Math.PI * 2);
      ctx.fillStyle = theme.sproutColors[0];
      ctx.fill();
      
      // Add grid branch
      ctx.beginPath();
      ctx.moveTo(gx, gyEnd);
      ctx.lineTo(gx + 30, gyEnd - 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(gx + 30, gyEnd - 20, 3, 0, Math.PI * 2);
      ctx.fillStyle = theme.sproutColors[1] || theme.sproutColors[0];
      ctx.fill();
    });

    // 3. Draw Overlapping Waves (Organic landscape curves)
    // Wave 1 (Back, subtler)
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.bezierCurveTo(width * 0.25, height * 0.7, width * 0.75, height * 0.9, width, height * 0.85);
    ctx.lineTo(width, height);
    ctx.closePath();
    const waveGrad1 = ctx.createLinearGradient(0, height * 0.7, 0, height);
    waveGrad1.addColorStop(0, setAlpha(theme.decorColor1, 0.15));
    waveGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = waveGrad1;
    ctx.fill();

    // Wave 2 (Middle)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.9);
    ctx.bezierCurveTo(width * 0.3, height * 0.95, width * 0.6, height * 0.75, width, height);
    ctx.lineTo(width, height);
    ctx.closePath();
    const waveGrad2 = ctx.createLinearGradient(0, height * 0.75, 0, height);
    waveGrad2.addColorStop(0, setAlpha(theme.decorColor2, 0.2));
    waveGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = waveGrad2;
    ctx.fill();

    // Wave 3 (Front, left-heavy)
    ctx.beginPath();
    ctx.moveTo(0, height * 0.8);
    ctx.bezierCurveTo(width * 0.2, height * 0.75, width * 0.45, height * 0.92, width, height * 0.95);
    ctx.lineTo(width, height);
    ctx.closePath();
    const waveGrad3 = ctx.createLinearGradient(0, height * 0.75, 0, height);
    waveGrad3.addColorStop(0, setAlpha(theme.decorColor1, 0.15));
    waveGrad3.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = waveGrad3;
    ctx.fill();

    // 4. Draw Premium Growing Sprout Branches
    // Left Sprout Branch
    drawSproutBranch(ctx, width * 0.08, height * 0.95, height * 0.45, 1, theme);
    // Right Sprout Branch (behind details card)
    drawSproutBranch(ctx, width * 0.85, height * 0.95, height * 0.5, -1, theme);
    // Extra branch near the middle-right spacer
    drawSproutBranch(ctx, width * 0.58, height * 0.98, height * 0.35, 1, theme);

    // 5. Draw Floating Leaves in background
    const floatingLeaves = [
      { rx: 0.18, ry: 0.25, s: 0.6, a: 0.5 },
      { rx: 0.28, ry: 0.15, s: 0.4, a: -0.3 },
      { rx: 0.48, ry: 0.35, s: 0.5, a: 1.2 },
      { rx: 0.68, ry: 0.25, s: 0.45, a: -0.8 },
      { rx: 0.75, ry: 0.12, s: 0.55, a: 0.4 },
      { rx: 0.92, ry: 0.3, s: 0.6, a: 2.1 }
    ];

    const c1 = theme.sproutColors[0];
    const c2 = theme.sproutColors[1] || theme.sproutColors[0];

    floatingLeaves.forEach(leaf => {
      const lx = leaf.rx * width;
      const ly = leaf.ry * height;
      const ls = leaf.s * (height / 600); // Scale with height
      drawPremiumLeaf(ctx, lx, ly, ls, leaf.a, c1, c2);
    });

    // 6. Draw Sparkling Stars (`drawSparkle`)
    const sparkles = [
      { rx: 0.12, ry: 0.35, s: 12 },
      { rx: 0.22, ry: 0.55, s: 15 },
      { rx: 0.38, ry: 0.22, s: 10 },
      { rx: 0.62, ry: 0.45, s: 14 },
      { rx: 0.78, ry: 0.32, s: 16 },
      { rx: 0.88, ry: 0.18, s: 12 },
      { rx: 0.94, ry: 0.42, s: 10 }
    ];

    sparkles.forEach(sp => {
      const sx = sp.rx * width;
      const sy = sp.ry * height;
      const ss = sp.s * (height / 600); // Scale size with height
      drawSparkle(ctx, sx, sy, ss, '#FFFFFF');
    });

    ctx.restore();
  }

  // --- Core Rendering Logic ---
  
  function renderBanner() {
    resolveTheme();

    // 1. Get Settings
    const title = titleInput.value.trim() || '디지털새싹 인공지능 캠프';
    const subtitle = subtitleInput.value.trim() || '새싹처럼 피어나는 우리의 디지털 미래';
    const dateText = dateInput.value.trim() || '일시 정보 없음';
    const locationText = locationInput.value.trim() || '장소 정보 없음';
    const organizerText = organizerInput.value.trim() || '';
    
    const targetAudienceValue = getSelectedRadioValue('target-audience');
    const ratioValue = getSelectedRadioValue('banner-ratio');

    // Get Target Label
    let targetLabel = '초·중·고등학생 대상';
    if (targetAudienceValue === 'elementary') targetLabel = '초등학생 대상';
    else if (targetAudienceValue === 'middle') targetLabel = '중학생 대상';
    else if (targetAudienceValue === 'high') targetLabel = '고등학생 대상';
    else if (targetAudienceValue === 'all') targetLabel = '초·중·고교 공통';

    // 2. Set Canvas Resolution based on Aspect Ratio
    let cWidth = 3000;
    let cHeight = 600; // Default 5:1

    if (ratioValue === '3-1') {
      cHeight = 1000; // 3:1
    } else if (ratioValue === '16-9') {
      cHeight = 844; // Half-height of 16:9 (Approx. 3000 x 844)
    }

    canvas.width = cWidth;
    canvas.height = cHeight;

    // 3. Draw Background (Custom uploaded image or default gradient)
    if (uploadedBgImage) {
      const imgRatio = uploadedBgImage.width / uploadedBgImage.height;
      const canvasRatio = cWidth / cHeight;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawH = cHeight;
        drawW = cHeight * imgRatio;
        drawX = (cWidth - drawW) / 2;
        drawY = 0;
      } else {
        // Image is taller than canvas
        drawW = cWidth;
        drawH = cWidth / imgRatio;
        drawX = 0;
        drawY = (cHeight - drawH) / 2;
      }
      ctx.drawImage(uploadedBgImage, drawX, drawY, drawW, drawH);
    } else {
      // Default: Draw gradient
      const bgGrad = ctx.createLinearGradient(0, 0, cWidth, cHeight);
      if (activeTheme.bgGradient.length === 3) {
        bgGrad.addColorStop(0, activeTheme.bgGradient[0]);
        bgGrad.addColorStop(0.5, activeTheme.bgGradient[1]);
        bgGrad.addColorStop(1, activeTheme.bgGradient[2]);
      } else {
        bgGrad.addColorStop(0, activeTheme.bgGradient[0]);
        bgGrad.addColorStop(1, activeTheme.bgGradient[1]);
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cWidth, cHeight);
    }

    // 4. Draw Background Decorative Elements
    if (uploadedBgImage) {
      ctx.save();
      ctx.globalAlpha = 0.5; // Tone down decorations on custom backgrounds
      drawBackgroundDecorations(ctx, cWidth, cHeight, activeTheme, targetAudienceValue);
      ctx.restore();
    } else {
      drawBackgroundDecorations(ctx, cWidth, cHeight, activeTheme, targetAudienceValue);
    }

    // 5. Draw Layouts
    if (ratioValue === '5-1') {
      /* ==========================================
         LAYOUT: 5:1 Standard Banner
         ========================================== */
      // Draw target-specific Nurungzzi character on the left
      drawMascot(ctx, targetAudienceValue, 210, cHeight * 0.5, 310);

      // Draw Program Logo (Larger size)
      const logoWidth = drawProgramLogo(ctx, 420, 45, 90);
      
      // Target Badge next to logo
      const badgeX = 420 + logoWidth + 25;
      const badgeY = 45;
      const badgeH = 90;
      ctx.font = 'bold 28px "Noto Sans KR"';
      const badgeTextWidth = ctx.measureText(targetLabel).width;
      const badgeW = badgeTextWidth + 48;

      ctx.fillStyle = activeTheme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 45);
      ctx.fill();

      ctx.fillStyle = activeTheme.badgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetLabel, badgeX + badgeW/2, badgeY + badgeH/2 + 2);

      // Subtitle
      ctx.fillStyle = activeTheme.subtitleColor;
      ctx.font = '500 42px "Noto Sans KR"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(subtitle, 420, 180);

      // Main Title
      ctx.fillStyle = activeTheme.titleColor;
      ctx.font = 'bold 106px "Do Hyeon"';
      ctx.fillText(title, 420, 245);

      // Sponsor Logo bar (Bottom-left)
      const sponsorBarWidth = drawSponsors(ctx, 420, 455, 75);

      // Sponsor / Organizer text next to the bar
      if (organizerText) {
        ctx.fillStyle = activeTheme.isDark ? 'rgba(255,255,255,0.5)' : '#64748B';
        ctx.font = '400 26px "Noto Sans KR"';
        ctx.textBaseline = 'middle';
        ctx.fillText(organizerText, 420 + sponsorBarWidth + 24, 455 + 37.5);
      }

      // Right decorative mascot (Shifted slightly left to balance empty space)
      drawMascot(ctx, targetAudienceValue, 2750, cHeight * 0.5, 260, true);

    } else if (ratioValue === '3-1') {
      /* ==========================================
         LAYOUT: 3:1 PPT Insert Banner
         ========================================== */
      // Draw target-specific Nurungzzi character on the left
      drawMascot(ctx, targetAudienceValue, 240, cHeight * 0.45, 430);

      // Draw Program Logo (Larger size)
      const logoWidth = drawProgramLogo(ctx, 500, 70, 120);

      // Target Badge next to logo
      const badgeX = 500 + logoWidth + 28;
      const badgeY = 70;
      const badgeH = 120;
      ctx.font = 'bold 38px "Noto Sans KR"';
      const badgeTextWidth = ctx.measureText(targetLabel).width;
      const badgeW = badgeTextWidth + 56;

      ctx.fillStyle = activeTheme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60);
      ctx.fill();

      ctx.fillStyle = activeTheme.badgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetLabel, badgeX + badgeW/2, badgeY + badgeH/2 + 2);

      // Subtitle
      ctx.fillStyle = activeTheme.subtitleColor;
      ctx.font = '500 52px "Noto Sans KR"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(subtitle, 500, 220);

      // Main Title
      ctx.fillStyle = activeTheme.titleColor;
      ctx.font = 'bold 135px "Do Hyeon"';
      ctx.fillText(title, 500, 295);

      // Sponsor Logo bar
      const sponsorBarWidth = drawSponsors(ctx, 500, 530, 85);

      // Organizer text next to the bar
      if (organizerText) {
        ctx.fillStyle = activeTheme.isDark ? 'rgba(255,255,255,0.5)' : '#64748B';
        ctx.font = '400 30px "Noto Sans KR"';
        ctx.textBaseline = 'middle';
        ctx.fillText(organizerText, 500 + sponsorBarWidth + 28, 530 + 42.5);
      }

      // Secondary floating mascot (Centered and scaled nicely)
      drawMascot(ctx, targetAudienceValue, 2750, cHeight * 0.5, 360, true);

    } else if (ratioValue === '16-9') {
      /* ==========================================
         LAYOUT: 16:9 PPT Slide Banner (Half-Height)
         ========================================== */
      // Draw target-specific Nurungzzi character on the left
      drawMascot(ctx, targetAudienceValue, 220, cHeight * 0.5, 340);

      // Draw Program Logo (Larger size)
      const logoWidth = drawProgramLogo(ctx, 420, 50, 100);

      // Target Badge next to logo
      const badgeX = 420 + logoWidth + 24;
      const badgeY = 50;
      const badgeH = 100;
      ctx.font = 'bold 28px "Noto Sans KR"';
      const badgeTextWidth = ctx.measureText(targetLabel).width;
      const badgeW = badgeTextWidth + 48;

      ctx.fillStyle = activeTheme.badgeBg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 50);
      ctx.fill();

      ctx.fillStyle = activeTheme.badgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetLabel, badgeX + badgeW/2, badgeY + badgeH/2 + 2);

      // Subtitle
      ctx.fillStyle = activeTheme.subtitleColor;
      ctx.font = '500 44px "Noto Sans KR"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(subtitle, 420, 195);

      // Main Title
      ctx.fillStyle = activeTheme.titleColor;
      ctx.font = 'bold 112px "Do Hyeon"';
      ctx.fillText(title, 420, 260);

      // Sponsor Logo bar
      const sponsorBarWidth = drawSponsors(ctx, 420, 470, 80);

      // Organizer text next to the bar
      if (organizerText) {
        ctx.fillStyle = activeTheme.isDark ? 'rgba(255,255,255,0.5)' : '#64748B';
        ctx.font = '400 26px "Noto Sans KR"';
        ctx.textBaseline = 'middle';
        ctx.fillText(organizerText, 420 + sponsorBarWidth + 24, 470 + 40);
      }

      // Right decorative mascot (Centered and scaled nicely)
      drawMascot(ctx, targetAudienceValue, 2750, cHeight * 0.5, 270, true);
    }
  }

  // --- Dynamic Theme Change Handler ---

  function applyTheme(themeKey) {
    currentThemeKey = themeKey;
    
    // Update theme button selection states
    themeBtns.forEach(btn => {
      if (btn.dataset.theme === themeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderBanner();
  }

  // --- Event Listeners Setup ---

  // Listen for changes in form inputs
  [titleInput, subtitleInput, dateInput, locationInput, organizerInput].forEach(input => {
    input.addEventListener('input', renderBanner);
  });

  // Target radio button changes
  targetRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateTargetCardStyles();
      // If theme is set to 'auto', resolve and update the canvas theme
      if (currentThemeKey === 'auto') {
        renderBanner();
      }
    });
  });

  // Ratio radio button changes
  ratioRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updateRatioStyles();
      renderBanner();
    });
  });

  // Theme button clicks
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
    });
  });

  // --- Image Upload Event Handlers ---

  // Background Upload Mode Toggles
  bgUploadModes.forEach(radio => {
    radio.addEventListener('change', () => {
      // Toggle active styling
      bgUploadModes.forEach(r => {
        const label = r.closest('.mode-label');
        if (r.checked) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      });

      // Show/Hide relevant input box
      const mode = getSelectedRadioValue('bg-upload-mode');
      if (mode === 'file') {
        bgFileWrapper.style.display = 'block';
        bgFolderWrapper.style.display = 'none';
        
        if (uploadedSingleBgFile) {
          loadAndSetBgImage(uploadedSingleBgFile, false);
          resetBgBtn.style.display = 'inline-block';
          rerollBgBtn.style.display = 'none';
        } else {
          uploadedBgImage = null;
          bgUploadStatus.style.display = 'none';
          resetBgBtn.style.display = 'none';
          rerollBgBtn.style.display = 'none';
          renderBanner();
        }
      } else {
        bgFileWrapper.style.display = 'none';
        bgFolderWrapper.style.display = 'block';
        
        if (uploadedBgFolderFiles.length > 0) {
          const currentIsFromFolder = uploadedBgFolderFiles.some(f => f.name === currentBgFileName);
          if (currentIsFromFolder && uploadedBgImage) {
            bgUploadStatus.style.display = 'block';
            bgUploadStatus.innerHTML = `📁 <strong>폴더 업로드 상태</strong><br>총 ${uploadedBgFolderFiles.length}개의 이미지 중 선택됨<br>📄 현재 이미지: <span style="color: var(--accent-primary);">${currentBgFileName}</span>`;
            resetBgBtn.style.display = 'inline-block';
            rerollBgBtn.style.display = 'inline-block';
            renderBanner();
          } else {
            const randomFile = uploadedBgFolderFiles[Math.floor(Math.random() * uploadedBgFolderFiles.length)];
            loadAndSetBgImage(randomFile, true);
            resetBgBtn.style.display = 'inline-block';
            rerollBgBtn.style.display = 'inline-block';
          }
        } else {
          uploadedBgImage = null;
          bgUploadStatus.style.display = 'none';
          resetBgBtn.style.display = 'none';
          rerollBgBtn.style.display = 'none';
          renderBanner();
        }
      }
    });
  });

  // Helper to load image file from Blob/File object and render
  function loadAndSetBgImage(file, isFolderMode = false) {
    if (!file) return;
    currentBgFileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        uploadedBgImage = img;
        resetBgBtn.style.display = 'inline-block';
        
        // Show status summary
        bgUploadStatus.style.display = 'block';
        if (isFolderMode) {
          bgUploadStatus.innerHTML = `📁 <strong>폴더 업로드 상태</strong><br>총 ${uploadedBgFolderFiles.length}개의 이미지 중 랜덤 선택됨<br>📄 현재 이미지: <span style="color: var(--accent-primary); font-weight: 500;">${currentBgFileName}</span>`;
        } else {
          bgUploadStatus.innerHTML = `📄 <strong>단일 파일 업로드 상태</strong><br>파일명: <span style="color: var(--accent-primary); font-weight: 500;">${currentBgFileName}</span>`;
        }
        
        renderBanner();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // 1-A. Background Image (Single File) Upload
  uploadBgInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadedSingleBgFile = file;
      loadAndSetBgImage(file, false);
    }
  });

  // 1-B. Background Folder Upload (Folder Selection for Random choice)
  uploadBgFolderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    uploadedBgFolderFiles = files;
    
    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      loadAndSetBgImage(randomFile, true);
      rerollBgBtn.style.display = 'inline-block';
      resetBgBtn.style.display = 'inline-block';
    } else {
      alert('선택한 폴더에 이미지 파일(png, jpg, jpeg 등)이 존재하지 않습니다.');
      bgUploadStatus.style.display = 'none';
      uploadedBgImage = null;
      renderBanner();
    }
  });

  // Background Folder - Reroll (Select another random image from folder)
  rerollBgBtn.addEventListener('click', () => {
    if (uploadedBgFolderFiles.length > 0) {
      const randomFile = uploadedBgFolderFiles[Math.floor(Math.random() * uploadedBgFolderFiles.length)];
      loadAndSetBgImage(randomFile, true);
    }
  });

  // Background Image/Folder Reset
  resetBgBtn.addEventListener('click', () => {
    uploadedBgImage = null;
    uploadedSingleBgFile = null;
    uploadedBgFolderFiles = [];
    currentBgFileName = '';
    uploadBgInput.value = '';
    uploadBgFolderInput.value = '';
    resetBgBtn.style.display = 'none';
    rerollBgBtn.style.display = 'none';
    bgUploadStatus.style.display = 'none';
    renderBanner();
  });

  // 2. Custom Character/Logo Image Upload
  uploadCharInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          uploadedCharImage = img;
          resetCharBtn.style.display = 'inline-block';
          renderBanner();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Custom Character Image Reset
  resetCharBtn.addEventListener('click', () => {
    uploadedCharImage = null;
    uploadCharInput.value = ''; // Clear file input
    resetCharBtn.style.display = 'none';
    renderBanner();
  });

  // --- High Resolution JPG Export ---
  
  downloadBtn.addEventListener('click', () => {
    const titleVal = titleInput.value.trim() || '디지털새싹_현수막';
    const targetVal = getSelectedRadioValue('target-audience');
    const ratioVal = getSelectedRadioValue('banner-ratio');
    
    let targetName = '초등';
    if (targetVal === 'middle') targetName = '중등';
    else if (targetVal === 'high') targetName = '고등';
    else if (targetVal === 'all') targetName = '공통';

    const cleanTitle = titleVal.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20);
    const filename = `${cleanTitle}_${targetName}_${ratioVal}.jpg`;

    try {
      const dataURL = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error generating image download:', e);
      alert('이미지 생성 중 오류가 발생했습니다. 브라우저 보안 설정을 확인하세요.');
    }
  });

  // --- Initial Start Sequence ---
  
  // Preload UI state
  updateTargetCardStyles();
  updateRatioStyles();
  
  // Preload all image assets, check fonts, then draw first frame
  loadResources(() => {
    console.log('All image resources preloaded successfully.');
    if (document.fonts) {
      document.fonts.ready.then(() => {
        console.log('All fonts loaded, rendering initial canvas.');
        renderBanner();
      });
    } else {
      setTimeout(renderBanner, 600);
    }
  });
});

// ==========================================
// grid.js — FEAT-1: 격자 오버레이 렌더링
// Lv.1 성긴 / Lv.2 중간 / Lv.3 촘촘한
// ==========================================

const GRID_CONFIG = {
  lv1: { cellSize: 40, lineWidth: 1.0, opacity: 0.70 },
  lv2: { cellSize: 20, lineWidth: 1.0, opacity: 0.70 },
  lv3: { cellSize: 8,  lineWidth: 0.5, opacity: 0.60 }
};

/**
 * Canvas에 격자를 그린다
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} level - 'lv1' | 'lv2' | 'lv3'
 * @param {number} width - Canvas 너비
 * @param {number} height - Canvas 높이
 * @param {string} color - 격자 색상 (기본: #FF6B00)
 */
function drawGrid(ctx, level, width, height, color) {
  const config = GRID_CONFIG[level] || GRID_CONFIG.lv2;
  const { cellSize, lineWidth, opacity } = config;
  const gridColor = color || '#FF6B00';

  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = opacity;

  // 세로선
  for (let x = 0; x <= width; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  // 가로선
  for (let y = 0; y <= height; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

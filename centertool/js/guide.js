// ==========================================
// guide.js — FEAT-2: L자 코너 가이드 + 중앙 십자선
// 포켓몬 카드 비율 (63mm × 88mm = 약 5:7) 기준
// ==========================================

const GUIDE_CONFIG = {
  cornerSize: 48,       // L자 변 길이 (px)
  lineWidth: 3,         // L자 선 굵기
  cardRatioW: 63,       // 포켓몬 카드 가로 (mm)
  cardRatioH: 88,       // 포켓몬 카드 세로 (mm)
  padding: 48,          // 카드 영역과 화면 가장자리 사이 여백
  controlBarH: 56,      // 컨트롤 바 높이 (CSS와 동일하게)
  adBannerH: 50,        // 광고 배너 높이 (CSS와 동일하게)
};

/**
 * 카드 가이드 영역 좌표 계산
 * @param {number} canvasW - Canvas 너비
 * @param {number} canvasH - Canvas 높이
 * @returns {{left, top, right, bottom, width, height}}
 */
function getCardBounds(canvasW, canvasH) {
  const { cardRatioW, cardRatioH, padding } = GUIDE_CONFIG;
  const ratio = cardRatioW / cardRatioH;

  const usableW = canvasW - padding * 2;
  const usableH = canvasH - padding * 2;

  let cardW, cardH;

  if (usableW / usableH < ratio) {
    // 너비 기준으로 맞춤
    cardW = usableW;
    cardH = cardW / ratio;
  } else {
    // 높이 기준으로 맞춤
    cardH = usableH;
    cardW = cardH * ratio;
  }

  const left = (canvasW - cardW) / 2;
  const top  = (canvasH - cardH) / 2;

  return {
    left,
    top,
    right:  left + cardW,
    bottom: top  + cardH,
    width:  cardW,
    height: cardH
  };
}

/**
 * 4개 코너에 L자 가이드를 그린다 (FEAT-2)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {string} color
 */
function drawCornerGuides(ctx, canvasW, canvasH, color) {
  const b = getCardBounds(canvasW, canvasH);
  const s = GUIDE_CONFIG.cornerSize;
  const lw = GUIDE_CONFIG.lineWidth;
  const c = color || '#FF6B00';

  ctx.save();
  ctx.strokeStyle = c;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  ctx.globalAlpha = 1.0;

  // ┌ 좌상단
  ctx.beginPath();
  ctx.moveTo(b.left, b.top + s);
  ctx.lineTo(b.left, b.top);
  ctx.lineTo(b.left + s, b.top);
  ctx.stroke();

  // ┐ 우상단
  ctx.beginPath();
  ctx.moveTo(b.right - s, b.top);
  ctx.lineTo(b.right, b.top);
  ctx.lineTo(b.right, b.top + s);
  ctx.stroke();

  // └ 좌하단
  ctx.beginPath();
  ctx.moveTo(b.left, b.bottom - s);
  ctx.lineTo(b.left, b.bottom);
  ctx.lineTo(b.left + s, b.bottom);
  ctx.stroke();

  // ┘ 우하단
  ctx.beginPath();
  ctx.moveTo(b.right - s, b.bottom);
  ctx.lineTo(b.right, b.bottom);
  ctx.lineTo(b.right, b.bottom - s);
  ctx.stroke();

  ctx.restore();
}

/**
 * 중앙 십자선 + 원을 그린다 (FEAT-2)
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 */
function drawCrosshair(ctx, canvasW, canvasH) {
  const b = getCardBounds(canvasW, canvasH);
  const cx = b.left + b.width  / 2;
  const cy = b.top  + b.height / 2;
  const lenX = canvasW * 0.10;  // 화면 너비의 10%
  const lenY = canvasH * 0.10;  // 화면 높이의 10%
  const r = 8;

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.85;

  // 수평선
  ctx.beginPath();
  ctx.moveTo(cx - lenX, cy);
  ctx.lineTo(cx - r - 2, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + r + 2, cy);
  ctx.lineTo(cx + lenX, cy);
  ctx.stroke();

  // 수직선
  ctx.beginPath();
  ctx.moveTo(cx, cy - lenY);
  ctx.lineTo(cx, cy - r - 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy + r + 2);
  ctx.lineTo(cx, cy + lenY);
  ctx.stroke();

  // 중앙 원
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

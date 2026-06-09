// ==========================================
// guide.js — FEAT-2: L자 코너 가이드 + 중앙 십자선
// 포켓몬 카드 비율 (63mm × 88mm = 약 5:7) 기준
// ==========================================

const GUIDE_CONFIG = {
  cardRatioW: 63,
  cardRatioH: 88,
  padding: 48,
};

function getCardBounds(canvasW, canvasH) {
  // 수동 지정 코너가 있으면 우선 사용
  const custom = (typeof getCustomCardBounds === 'function') && getCustomCardBounds();
  if (custom) return custom;

  const { cardRatioW, cardRatioH, padding } = GUIDE_CONFIG;
  const ratio = cardRatioW / cardRatioH;

  const usableW = Math.max(canvasW - padding * 2, 1);
  const usableH = Math.max(canvasH - padding * 2, 1);

  let cardW, cardH;
  if (usableW / usableH < ratio) {
    cardW = usableW;
    cardH = cardW / ratio;
  } else {
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

// PDF 기준: 코너 L자는 카드 가로 기준 약 10mm 길이
function drawCornerGuides(ctx, canvasW, canvasH, color) {
  const b      = getCardBounds(canvasW, canvasH);
  const pxPerMm = b.width / 63;
  const s      = Math.round(10 * pxPerMm); // 10mm

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineCap     = 'square';
  ctx.setLineDash([]);

  // 카드 경계 사각형
  ctx.globalAlpha = 0.85;
  ctx.lineWidth   = 1;
  ctx.strokeRect(b.left, b.top, b.width, b.height);

  // L자 코너 (두꺼운 선)
  ctx.globalAlpha = 1.0;
  ctx.lineWidth   = 2.5;

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

// PDF 기준: 십자선은 카드 전체 폭/높이를 가로지르는 단일 선 + 원
function drawCrosshair(ctx, canvasW, canvasH) {
  const b  = getCardBounds(canvasW, canvasH);
  const cx = b.left + b.width  / 2;
  const cy = b.top  + b.height / 2;
  const r  = Math.max(6, b.width * 0.015); // 카드 폭의 1.5%

  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth   = 1;
  ctx.globalAlpha = 0.85;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(b.left,  cy);
  ctx.lineTo(b.right, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, b.top);
  ctx.lineTo(cx, b.bottom);
  ctx.stroke();

  ctx.globalAlpha = 0.90;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

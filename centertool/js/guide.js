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
  const b       = getCardBounds(canvasW, canvasH);
  const pxPerMm = b.width / 63;
  const s       = Math.round(10 * pxPerMm); // 10mm
  const o       = 1; // 경계선 바깥 오프셋 (px)

  ctx.save();
  ctx.lineCap   = 'square';
  ctx.setLineDash([]);

  // 카드 경계 사각형 (흰색)
  ctx.strokeStyle = '#FFFFFF';
  ctx.globalAlpha = 0.85;
  ctx.lineWidth   = 1;
  ctx.strokeRect(b.left, b.top, b.width, b.height);

  // L자 코너 — 빨간색, 경계선보다 1px 바깥
  ctx.strokeStyle = '#FF3B30';
  ctx.globalAlpha = 1.0;
  ctx.lineWidth   = 2.5;

  const L = b.left   - o;
  const T = b.top    - o;
  const R = b.right  + o;
  const B = b.bottom + o;

  // ┌ 좌상단
  ctx.beginPath();
  ctx.moveTo(L, T + s);
  ctx.lineTo(L, T);
  ctx.lineTo(L + s, T);
  ctx.stroke();

  // ┐ 우상단
  ctx.beginPath();
  ctx.moveTo(R - s, T);
  ctx.lineTo(R, T);
  ctx.lineTo(R, T + s);
  ctx.stroke();

  // └ 좌하단
  ctx.beginPath();
  ctx.moveTo(L, B - s);
  ctx.lineTo(L, B);
  ctx.lineTo(L + s, B);
  ctx.stroke();

  // ┘ 우하단
  ctx.beginPath();
  ctx.moveTo(R - s, B);
  ctx.lineTo(R, B);
  ctx.lineTo(R, B - s);
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

// ==========================================
// grid.js — FEAT-1: 포켓몬 카드 센터링 측정 격자
// 실물 센터툴과 동일: 홀수=실선, 짝수=점선, 각 모서리 1~10mm 눈금
// SOLID LINES = ODD NUMBERS / DASHED LINES = EVEN NUMBERS
// ==========================================

const MEASURE_COUNT = 10; // 각 모서리에서 10mm

/**
 * 카드 경계에서 안쪽으로 1~10mm 눈금선을 그린다
 * 홀수 = 실선(solid), 짝수 = 점선(dashed)
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} level - 'lv1' | 'lv2' | 'lv3' (현재 디자인에서는 동일 적용)
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {string} color
 */
function drawGrid(ctx, level, canvasW, canvasH, color) {
  const b = getCardBounds(canvasW, canvasH);
  const c = color || '#FF6B00';

  // 카드 가로 63mm 기준으로 px/mm 계산
  const pxPerMm = b.width / 63;

  ctx.save();

  // ── 눈금선 ──
  for (let i = 1; i <= MEASURE_COUNT; i++) {
    const d = i * pxPerMm;
    const isOdd = (i % 2 !== 0);

    ctx.strokeStyle = c;
    ctx.lineWidth  = isOdd ? 1.0 : 0.7;
    ctx.globalAlpha = isOdd ? 0.82 : 0.55;
    ctx.setLineDash(isOdd ? [] : [3, 3]);

    // 위 → 아래 방향 수평선 (top 기준)
    ctx.beginPath();
    ctx.moveTo(b.left,  b.top + d);
    ctx.lineTo(b.right, b.top + d);
    ctx.stroke();

    // 아래 → 위 방향 수평선 (bottom 기준)
    ctx.beginPath();
    ctx.moveTo(b.left,  b.bottom - d);
    ctx.lineTo(b.right, b.bottom - d);
    ctx.stroke();

    // 왼쪽 → 오른쪽 방향 수직선 (left 기준)
    ctx.beginPath();
    ctx.moveTo(b.left + d, b.top);
    ctx.lineTo(b.left + d, b.bottom);
    ctx.stroke();

    // 오른쪽 → 왼쪽 방향 수직선 (right 기준)
    ctx.beginPath();
    ctx.moveTo(b.right - d, b.top);
    ctx.lineTo(b.right - d, b.bottom);
    ctx.stroke();
  }

  // ── 눈금 숫자 레이블 ──
  ctx.setLineDash([]);
  ctx.globalAlpha  = 0.90;
  ctx.fillStyle    = c;
  ctx.font         = '8px "Courier New", monospace';

  for (let i = 1; i <= MEASURE_COUNT; i++) {
    const d     = i * pxPerMm;
    const label = String(i);

    // 위에서 내려오는 수평선 — 좌우 끝 레이블
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, b.left + 2,  b.top + d);
    ctx.textAlign    = 'right';
    ctx.fillText(label, b.right - 2, b.top + d);

    // 아래에서 올라오는 수평선 — 좌우 끝 레이블
    ctx.textAlign    = 'left';
    ctx.fillText(label, b.left + 2,  b.bottom - d);
    ctx.textAlign    = 'right';
    ctx.fillText(label, b.right - 2, b.bottom - d);

    // 왼쪽에서 오는 수직선 — 상하 끝 레이블
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, b.left + d, b.top + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, b.left + d, b.bottom - 2);

    // 오른쪽에서 오는 수직선 — 상하 끝 레이블
    ctx.textBaseline = 'top';
    ctx.fillText(label, b.right - d, b.top + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, b.right - d, b.bottom - 2);
  }

  ctx.restore();
}

// ==========================================
// grid.js — FEAT-1: Pokemon Card Centering Tool
// PDF 원본 그대로: SOLID = ODD, DASHED = EVEN, 1~10mm 눈금
// ==========================================

const MEASURE_COUNT = 10;

function drawGrid(ctx, level, canvasW, canvasH, color) {
  const b = getCardBounds(canvasW, canvasH);
  const pxPerMm = b.width / 63; // 카드 가로 63mm 기준

  ctx.save();

  // ── 측정 눈금선 ──────────────────────────────
  for (let i = 1; i <= MEASURE_COUNT; i++) {
    const d     = i * pxPerMm;
    const isOdd = (i % 2 !== 0);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth   = isOdd ? 1.2 : 0.8;
    ctx.globalAlpha = isOdd ? 0.90 : 0.60;
    ctx.setLineDash(isOdd ? [] : [4, 4]); // 홀수=실선, 짝수=점선

    // 위(top) → 수평선 전체 폭
    ctx.beginPath();
    ctx.moveTo(b.left,  b.top + d);
    ctx.lineTo(b.right, b.top + d);
    ctx.stroke();

    // 아래(bottom) → 수평선 전체 폭
    ctx.beginPath();
    ctx.moveTo(b.left,  b.bottom - d);
    ctx.lineTo(b.right, b.bottom - d);
    ctx.stroke();

    // 왼쪽(left) → 수직선 전체 높이
    ctx.beginPath();
    ctx.moveTo(b.left + d, b.top);
    ctx.lineTo(b.left + d, b.bottom);
    ctx.stroke();

    // 오른쪽(right) → 수직선 전체 높이
    ctx.beginPath();
    ctx.moveTo(b.right - d, b.top);
    ctx.lineTo(b.right - d, b.bottom);
    ctx.stroke();
  }

  // ── 숫자 레이블 ──────────────────────────────
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.95;
  ctx.fillStyle   = '#FFFFFF';
  ctx.font        = `${Math.max(7, Math.round(pxPerMm * 1.5))}px "Courier New", monospace`;

  for (let i = 1; i <= MEASURE_COUNT; i++) {
    const d     = i * pxPerMm;
    const label = String(i);

    // 위에서 내려오는 수평선 — 좌/우 끝
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, b.left + 2,  b.top + d);
    ctx.textAlign    = 'right';
    ctx.fillText(label, b.right - 2, b.top + d);

    // 아래에서 올라오는 수평선 — 좌/우 끝
    ctx.textAlign    = 'left';
    ctx.fillText(label, b.left + 2,  b.bottom - d);
    ctx.textAlign    = 'right';
    ctx.fillText(label, b.right - 2, b.bottom - d);

    // 왼쪽에서 오는 수직선 — 상/하 끝
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, b.left + d, b.top + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, b.left + d, b.bottom - 2);

    // 오른쪽에서 오는 수직선 — 상/하 끝
    ctx.textBaseline = 'top';
    ctx.fillText(label, b.right - d, b.top + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, b.right - d, b.bottom - 2);
  }

  ctx.restore();
}

// corners.js — 카드 영역 드래그 조절 (크롭 방식)

const CARD_RATIO_W  = 63;  // 포켓몬 카드 mm
const CARD_RATIO_H  = 88;
const HANDLE_RADIUS = 30;  // 코너 핸들 터치 감지 반경 (px)
const MIN_RECT_SIZE = 60;  // 최소 사각형 크기 (px)

let _customBounds = null;
let _active       = false;
let _rect         = null; // 작업 중인 사각형 { x, y, w, h }
let _drag         = null; // { type: 'corner'|'move', corner?, startX, startY, startRect }

function _handles(r) {
  return {
    tl: { x: r.x,       y: r.y       },
    tr: { x: r.x + r.w, y: r.y       },
    br: { x: r.x + r.w, y: r.y + r.h },
    bl: { x: r.x,       y: r.y + r.h },
  };
}

// 코너 설정 시작 — 카드 비율 기본 직사각형으로 초기화
function startCornerSetup(canvasW, canvasH) {
  _active = true;
  _drag   = null;

  const margin = Math.min(canvasW, canvasH) * 0.12;
  const availW = canvasW - margin * 2;
  const availH = canvasH - margin * 2;

  let w, h;
  if ((availW / availH) < (CARD_RATIO_W / CARD_RATIO_H)) {
    w = availW;
    h = w * CARD_RATIO_H / CARD_RATIO_W;
  } else {
    h = availH;
    w = h * CARD_RATIO_W / CARD_RATIO_H;
  }

  _rect = { x: (canvasW - w) / 2, y: (canvasH - h) / 2, w, h };
}

// 취소 — 변경 사항 버림
function cancelCornerSetup() {
  _active = false;
  _rect   = null;
  _drag   = null;
}

// 확정 — 현재 직사각형을 bounds로 저장
function finalizeCornerSetup() {
  if (!_rect) return;
  const { x, y, w, h } = _rect;
  _customBounds = { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h };
  _active = false;
  _rect   = null;
  _drag   = null;
}

// 터치 시작 — 코너 핸들 또는 내부(이동) 감지
function startDrag(touchX, touchY) {
  if (!_active || !_rect) return false;

  for (const [key, pt] of Object.entries(_handles(_rect))) {
    if (Math.hypot(touchX - pt.x, touchY - pt.y) <= HANDLE_RADIUS) {
      _drag = { type: 'corner', corner: key, startX: touchX, startY: touchY, startRect: { ..._rect } };
      return true;
    }
  }

  if (touchX >= _rect.x && touchX <= _rect.x + _rect.w &&
      touchY >= _rect.y && touchY <= _rect.y + _rect.h) {
    _drag = { type: 'move', startX: touchX, startY: touchY, startRect: { ..._rect } };
    return true;
  }

  return false;
}

// 터치 이동 — 사각형 업데이트
function moveDrag(touchX, touchY) {
  if (!_drag || !_rect) return;
  const dx = touchX - _drag.startX;
  const dy = touchY - _drag.startY;
  const sr = _drag.startRect;

  if (_drag.type === 'move') {
    _rect.x = sr.x + dx;
    _rect.y = sr.y + dy;
    return;
  }

  const cw = (v) => Math.max(MIN_RECT_SIZE, v);
  const ch = (v) => Math.max(MIN_RECT_SIZE, v);

  switch (_drag.corner) {
    case 'tl':
      _rect.w = cw(sr.w - dx); _rect.h = ch(sr.h - dy);
      _rect.x = sr.x + sr.w - _rect.w;
      _rect.y = sr.y + sr.h - _rect.h;
      break;
    case 'tr':
      _rect.w = cw(sr.w + dx); _rect.h = ch(sr.h - dy);
      _rect.y = sr.y + sr.h - _rect.h;
      break;
    case 'br':
      _rect.w = cw(sr.w + dx); _rect.h = ch(sr.h + dy);
      break;
    case 'bl':
      _rect.w = cw(sr.w - dx); _rect.h = ch(sr.h + dy);
      _rect.x = sr.x + sr.w - _rect.w;
      break;
  }
}

// 터치 종료
function endDrag() {
  _drag = null;
}

// ── 공개 API ──
function isCornerSetupActive() { return _active; }
function hasCustomBounds()     { return _customBounds !== null; }
function getCustomCardBounds() { return _customBounds; }
function resetCustomBounds()   { _customBounds = null; }
function getWorkingRect()      { return _rect ? { ..._rect } : null; }
function getCornerHandles()    { return _rect ? _handles(_rect) : null; }
function isDragging()          { return _drag !== null; }

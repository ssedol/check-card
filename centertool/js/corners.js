// corners.js — 카드 영역 드래그 조절 (크롭 방식)

const CARD_RATIO_W  = 63;
const CARD_RATIO_H  = 88;
const HANDLE_RADIUS = 28;  // 모서리 핸들 터치 반경
const SIDE_RADIUS   = 24;  // 변 핸들 터치 반경
const MIN_RECT_SIZE = 60;

let _customBounds = null;
let _active       = false;
let _rect         = null;
let _drag         = null;

function _cornerHandles(r) {
  return {
    tl: { x: r.x,       y: r.y       },
    tr: { x: r.x + r.w, y: r.y       },
    br: { x: r.x + r.w, y: r.y + r.h },
    bl: { x: r.x,       y: r.y + r.h },
  };
}

function _sideHandles(r) {
  return {
    top:    { x: r.x + r.w / 2, y: r.y       },
    right:  { x: r.x + r.w,     y: r.y + r.h / 2 },
    bottom: { x: r.x + r.w / 2, y: r.y + r.h },
    left:   { x: r.x,           y: r.y + r.h / 2 },
  };
}

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

function cancelCornerSetup() {
  _active = false;
  _rect   = null;
  _drag   = null;
}

function finalizeCornerSetup() {
  if (!_rect) return;
  const { x, y, w, h } = _rect;
  _customBounds = { left: x, top: y, right: x + w, bottom: y + h, width: w, height: h };
  _active = false;
  _rect   = null;
  _drag   = null;
}

function startDrag(touchX, touchY) {
  if (!_active || !_rect) return false;

  // 모서리 핸들 우선
  for (const [key, pt] of Object.entries(_cornerHandles(_rect))) {
    if (Math.hypot(touchX - pt.x, touchY - pt.y) <= HANDLE_RADIUS) {
      _drag = { type: 'corner', corner: key, startX: touchX, startY: touchY, startRect: { ..._rect } };
      return true;
    }
  }

  // 변 핸들
  for (const [key, pt] of Object.entries(_sideHandles(_rect))) {
    if (Math.hypot(touchX - pt.x, touchY - pt.y) <= SIDE_RADIUS) {
      _drag = { type: 'side', side: key, startX: touchX, startY: touchY, startRect: { ..._rect } };
      return true;
    }
  }

  // 내부 이동
  if (touchX >= _rect.x && touchX <= _rect.x + _rect.w &&
      touchY >= _rect.y && touchY <= _rect.y + _rect.h) {
    _drag = { type: 'move', startX: touchX, startY: touchY, startRect: { ..._rect } };
    return true;
  }

  return false;
}

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

  if (_drag.type === 'side') {
    switch (_drag.side) {
      case 'top':
        _rect.h = ch(sr.h - dy);
        _rect.y = sr.y + sr.h - _rect.h;
        break;
      case 'bottom':
        _rect.h = ch(sr.h + dy);
        break;
      case 'left':
        _rect.w = cw(sr.w - dx);
        _rect.x = sr.x + sr.w - _rect.w;
        break;
      case 'right':
        _rect.w = cw(sr.w + dx);
        break;
    }
    return;
  }

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

function endDrag() { _drag = null; }

function isCornerSetupActive() { return _active; }
function hasCustomBounds()     { return _customBounds !== null; }
function getCustomCardBounds() { return _customBounds; }
function resetCustomBounds()   { _customBounds = null; }
function getWorkingRect()      { return _rect ? { ..._rect } : null; }
function getCornerHandles()    { return _rect ? _cornerHandles(_rect) : null; }
function getSideHandles()      { return _rect ? _sideHandles(_rect) : null; }
function isDragging()          { return _drag !== null; }

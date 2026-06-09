// corners.js — 카드 4개 모서리 수동 지정
// 순서: 좌상단 → 우상단 → 우하단 → 좌하단

const CORNER_LABELS = ['↖ 좌상단', '↗ 우상단', '↘ 우하단', '↙ 좌하단'];

let _customBounds = null; // 완료된 커스텀 경계
let _step         = 0;   // 0=비활성, 1~4=진행중
let _pts          = [];  // 수집된 좌표

function isCornerSetupActive() {
  return _step > 0;
}

function hasCustomBounds() {
  return _customBounds !== null;
}

function startCornerSetup() {
  _step = 1;
  _pts  = [];
}

function cancelCornerSetup() {
  _step = 0;
  _pts  = [];
}

function resetCustomBounds() {
  _customBounds = null;
  _step         = 0;
  _pts          = [];
}

// 좌표 추가. 4번째 완료 시 true 반환
function addCorner(x, y) {
  if (_step < 1 || _step > 4) return false;
  _pts.push({ x, y });
  _step++;

  if (_step > 4) {
    const [tl, tr, br, bl] = _pts;
    const left   = (tl.x + bl.x) / 2;
    const right  = (tr.x + br.x) / 2;
    const top    = (tl.y + tr.y) / 2;
    const bottom = (bl.y + br.y) / 2;
    _customBounds = { left, top, right, bottom, width: right - left, height: bottom - top };
    _step = 0;
    _pts  = [];
    return true;
  }
  return false;
}

function getCornerStep()      { return _step; }
function getCollectedPts()    { return [..._pts]; }
function getCustomCardBounds(){ return _customBounds; }
function getCornerLabel()     { return _step >= 1 ? CORNER_LABELS[_step - 1] : ''; }

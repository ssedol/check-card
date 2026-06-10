// level.js — 수평 감지 (DeviceOrientation API)
// 폰이 기울어진 채로 모서리를 찍으면 원근 왜곡이 생기므로 수평 확인 필요

let _gamma  = 0;    // 좌우 기울기 (-90 ~ +90)
let _beta   = 0;    // 앞뒤 기울기 (-180 ~ +180)
let _active = false;

function _onOrientation(e) {
  _gamma  = e.gamma || 0;
  _beta   = e.beta  || 0;
  _active = true;
}

function initLevelSensor() {
  if (!('DeviceOrientationEvent' in window)) return;
  window.addEventListener('deviceorientation', _onOrientation);
  _active = false;
}

// 카메라가 바닥을 향할 때(beta≈0, gamma≈0) 수평 여부 반환
function isPhoneLevel() {
  if (!_active) return false;
  return Math.abs(_gamma) < 2.5 && Math.abs(_beta) < 2.5;
}

// iOS 13+는 permission 필요 — 반드시 사용자 제스처 안에서 호출
async function requestLevelPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') initLevelSensor();
      return res === 'granted';
    } catch (_) {
      return false;
    }
  }
  // Android / 기타 — 권한 불필요
  initLevelSensor();
  return true;
}

// 캔버스에 버블 레벨 표시기 그리기
// 세로로 폰을 들고 카드를 바라볼 때: beta ≈ 90, gamma ≈ 0 이 수평 기준
function drawLevelIndicator(ctx, canvasW, canvasH) {
  if (!_active) return;

  const tiltX   = _gamma;  // 좌우 기울기
  const tiltY   = _beta;   // 앞뒤 기울기 (바닥 향할 때 0이 수평)
  const maxTilt = 15;           // 이 각도 이상이면 버블이 끝까지 이동

  const cx     = canvasW - 40;
  const cy     = 40;
  const outerR = 18;
  const bubR   = 6;

  // 버블 위치 (maxTilt 범위로 클램프)
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const bx = cx + clamp((tiltX / maxTilt) * (outerR - bubR), -(outerR - bubR), outerR - bubR);
  const by = cy + clamp((tiltY / maxTilt) * (outerR - bubR), -(outerR - bubR), outerR - bubR);

  const isLevel = Math.abs(tiltX) < 2.5 && Math.abs(tiltY) < 2.5;
  const color   = isLevel ? '#00FF88' : '#FFFFFF';
  const alpha   = isLevel ? 0.90 : 0.60;

  ctx.save();

  // 외부 원
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth   = 1.5;
  ctx.stroke();

  // 수평 / 수직 십자 눈금
  ctx.globalAlpha = alpha * 0.4;
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - outerR, cy); ctx.lineTo(cx + outerR, cy);
  ctx.moveTo(cx, cy - outerR); ctx.lineTo(cx, cy + outerR);
  ctx.stroke();

  // 중심 기준점
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fillStyle   = color;
  ctx.globalAlpha = alpha * 0.6;
  ctx.fill();

  // 버블
  ctx.beginPath();
  ctx.arc(bx, by, bubR, 0, Math.PI * 2);
  ctx.fillStyle   = color;
  ctx.globalAlpha = isLevel ? 0.92 : 0.80;
  ctx.fill();

  // 수평일 때 바깥 원 강조 (초록 링)
  if (isLevel) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#00FF88';
    ctx.globalAlpha = 0.35;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  ctx.restore();
}

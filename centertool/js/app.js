// ==========================================
// app.js — 메인 초기화 + 렌더링 루프 + 이벤트 처리
// ==========================================

let currentSettings = null;
let animationId = null;
let capturedBlob = null;
let eventsBound = false;

// ── 모바일 감지 ──
function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 900;
}

// ── 앱 초기화 ──
async function init() {
  // PC 감지
  if (!isMobile()) {
    document.getElementById('desktop-screen').classList.add('visible');
    return;
  }

  currentSettings = loadSettings();

  // 이미 카메라 권한이 있으면 바로 시작 (Android Chrome 등)
  try {
    const perm = await navigator.permissions.query({ name: 'camera' });
    if (perm.state === 'granted') {
      const ok = await startCamera();
      if (ok) { showApp(); return; }
    }
  } catch (_) {
    // permissions API 미지원 (iOS Safari) — 아래 권한 화면으로 진행
  }

  // 권한 없음 또는 미확인 — 버튼 클릭 후 카메라 시작
  document.getElementById('permission-screen').classList.add('visible');
}

// ── 앱 화면 표시 ──
function showApp() {
  document.getElementById('permission-screen').classList.remove('visible');
  document.getElementById('desktop-screen').classList.remove('visible');
  document.getElementById('app').classList.add('visible');

  setupCanvas();
  startRenderLoop();

  // Android는 권한 불필요 — 바로 센서 시작
  initLevelSensor();

  if (!eventsBound) {
    setupEventListeners();
    eventsBound = true;
  }
}

// ── 코너 설정 오버레이 렌더링 ──
function drawCornerOverlay(ctx, w, h) {
  const step = getCornerStep();
  const pts  = getCollectedPts();

  ctx.save();

  // 수집된 코너 점 표시
  pts.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
    ctx.fillStyle   = '#FFFFFF';
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth   = 2;
    ctx.stroke();
  });

  // 수집된 점들 사이 점선 연결
  if (pts.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = '#FFFFFF';
    ctx.globalAlpha = 0.45;
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 안내 텍스트 (그림자로 가독성 확보)
  const label = getCornerLabel();
  const text  = `${label} 터치  (${step}/4)`;
  ctx.shadowColor   = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur    = 10;
  ctx.fillStyle     = '#FFFFFF';
  ctx.globalAlpha   = 1;
  ctx.font          = 'bold 17px -apple-system, sans-serif';
  ctx.textAlign     = 'center';
  ctx.textBaseline  = 'middle';
  ctx.fillText(text, w / 2, 44);

  ctx.restore();
}

// ── 코너 버튼 UI 상태 업데이트 ──
function updateCornerUI() {
  const cornerBtn      = document.getElementById('corner-btn');
  const cornerResetBtn = document.getElementById('corner-reset-btn');
  const captureBtn     = document.getElementById('capture-btn');
  const canvas         = document.getElementById('overlay');

  if (isCornerSetupActive()) {
    cornerBtn.textContent      = '취소';
    cornerBtn.classList.add('active');
    cornerResetBtn.classList.remove('visible');
    captureBtn.disabled        = true;
    canvas.style.pointerEvents = 'auto'; // 터치 활성화
  } else if (hasCustomBounds()) {
    cornerBtn.textContent      = '재설정';
    cornerBtn.classList.remove('active');
    cornerResetBtn.classList.add('visible');
    captureBtn.disabled        = false;
    canvas.style.pointerEvents = 'none';
  } else {
    cornerBtn.textContent      = '코너';
    cornerBtn.classList.remove('active');
    cornerResetBtn.classList.remove('visible');
    captureBtn.disabled        = false;
    canvas.style.pointerEvents = 'none';
  }
}

// ── Canvas 크기 맞추기 ──
function setupCanvas() {
  const canvas = document.getElementById('overlay');
  resizeCanvas(canvas);

  window.addEventListener('resize', () => resizeCanvas(canvas));
  screen.orientation && screen.orientation.addEventListener('change', () => {
    setTimeout(() => resizeCanvas(canvas), 200);
  });
}

function resizeCanvas(canvas) {
  const video      = document.getElementById('video');
  const controlBar = document.getElementById('control-bar');
  const adBanner   = document.getElementById('ad-banner');

  canvas.width  = video.offsetWidth  || window.innerWidth;
  canvas.height = video.offsetHeight ||
    window.innerHeight -
    (controlBar ? controlBar.offsetHeight : 56) -
    (adBanner   ? adBanner.offsetHeight   : 50);
}

// ── 렌더링 루프 ──
function startRenderLoop() {
  if (animationId) cancelAnimationFrame(animationId);

  const canvas  = document.getElementById('overlay');
  const ctx     = canvas.getContext('2d');
  if (!ctx) { console.error('[센터툴] Canvas context 획득 실패'); return; }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentSettings.guide_visible) {
      drawCornerGuides(ctx, canvas.width, canvas.height, currentSettings.grid_color);
    }

    drawGrid(ctx, currentSettings.grid_level, canvas.width, canvas.height, currentSettings.grid_color);

    if (currentSettings.crosshair_visible) {
      drawCrosshair(ctx, canvas.width, canvas.height);
    }

    if (isCornerSetupActive()) {
      drawCornerOverlay(ctx, canvas.width, canvas.height);
    }

    drawLevelIndicator(ctx, canvas.width, canvas.height);

    animationId = requestAnimationFrame(render);
  }

  render();
}

// ── 토스트 표시 ──
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = type;
  toast.classList.add('visible');

  clearTimeout(toast._timer);
  // DesignSystem §7: 성공 2초 / 에러 3초
  const duration = type === 'error' ? 3000 : 2000;
  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}

// ── 이벤트 리스너 ──
function setupEventListeners() {

  // 캡처 버튼
  document.getElementById('capture-btn').addEventListener('click', async () => {
    const btn = document.getElementById('capture-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      capturedBlob = await captureFrame();
      btn.classList.remove('loading');
      btn.disabled = false;
      document.getElementById('action-modal').classList.add('visible');
    } catch (err) {
      btn.classList.remove('loading');
      btn.disabled = false;
      showToast('다시 시도해요', 'error');
      console.error('[센터툴] 캡처 오류:', err);
    }
  });

  // 저장 버튼
  document.getElementById('save-btn').addEventListener('click', async () => {
    if (!capturedBlob) return;
    document.getElementById('action-modal').classList.remove('visible');
    const ok = await saveImage(capturedBlob);
    showToast(ok ? '저장됐어요 ✓' : '다시 시도해요', ok ? 'success' : 'error');
    capturedBlob = null;
  });

  // 공유 버튼
  document.getElementById('share-btn').addEventListener('click', async () => {
    if (!capturedBlob) return;
    document.getElementById('action-modal').classList.remove('visible');
    const ok = await shareImage(capturedBlob);
    if (ok) showToast('공유됐어요 ✓');
    capturedBlob = null;
  });

  // 취소 버튼
  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('action-modal').classList.remove('visible');
    capturedBlob = null;
  });

  // 모달 바깥 클릭 시 닫기
  document.getElementById('action-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('action-modal')) {
      document.getElementById('action-modal').classList.remove('visible');
      capturedBlob = null;
    }
  });

  // 코너 설정 버튼 (iOS 수평 센서 권한도 함께 요청)
  document.getElementById('corner-btn').addEventListener('click', async () => {
    if (isCornerSetupActive()) {
      cancelCornerSetup();
    } else {
      await requestLevelPermission(); // iOS 13+: 사용자 제스처 안에서 요청
      startCornerSetup();
    }
    updateCornerUI();
  });

  // 코너 초기화 버튼
  document.getElementById('corner-reset-btn').addEventListener('click', () => {
    resetCustomBounds();
    updateCornerUI();
    showToast('자동 모드로 전환됐어요');
  });

  // 코너 설정 중 캔버스 터치
  const overlayCanvas = document.getElementById('overlay');
  overlayCanvas.addEventListener('touchstart', (e) => {
    if (!isCornerSetupActive()) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect  = overlayCanvas.getBoundingClientRect();
    const x     = touch.clientX - rect.left;
    const y     = touch.clientY - rect.top;

    const done = addCorner(x, y);
    if (done) {
      updateCornerUI();
      showToast('카드 위치 설정 완료 ✓');
    }
  }, { passive: false });

  // 권한 허용 버튼 (권한 안내 화면)
  const permBtn = document.getElementById('request-permission-btn');
  if (permBtn) {
    permBtn.addEventListener('click', async () => {
      currentSettings = loadSettings();
      const ok = await startCamera();
      if (ok) {
        showApp();
      } else {
        showToast('카메라 접근이 필요해요', 'error');
      }
    });
  }
}

// ── 시작 ──
document.addEventListener('DOMContentLoaded', init);

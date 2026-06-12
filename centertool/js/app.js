// ==========================================
// app.js — 메인 초기화 + 렌더링 루프 + 이벤트 처리
// ==========================================

let currentSettings = null;
let animationId = null;
let capturedBlob = null;

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

  // 이벤트 바인딩은 렌더 루프와 완전히 분리해서 가장 먼저 수행
  setupEventListeners();

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
  initLevelSensor();
}

// ── 코너 설정 오버레이 렌더링 (드래그 크롭 방식) ──
function drawCornerOverlay(ctx, w, h) {
  const rect         = getWorkingRect();
  const cornerHandles = getCornerHandles();
  const sideHandles   = getSideHandles();
  if (!rect) return;

  ctx.save();

  // 사각형 외부 어둡게
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.fill('evenodd');

  // 사각형 테두리
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth   = 2;
  ctx.globalAlpha = 0.9;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

  // 3등분 가이드선
  ctx.globalAlpha = 0.25;
  ctx.lineWidth   = 0.8;
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w / 3,     rect.y);
  ctx.lineTo(rect.x + rect.w / 3,     rect.y + rect.h);
  ctx.moveTo(rect.x + rect.w * 2 / 3, rect.y);
  ctx.lineTo(rect.x + rect.w * 2 / 3, rect.y + rect.h);
  ctx.moveTo(rect.x,           rect.y + rect.h / 3);
  ctx.lineTo(rect.x + rect.w,  rect.y + rect.h / 3);
  ctx.moveTo(rect.x,           rect.y + rect.h * 2 / 3);
  ctx.lineTo(rect.x + rect.w,  rect.y + rect.h * 2 / 3);
  ctx.stroke();

  // 변 핸들 (직사각형 바)
  if (sideHandles) {
    ctx.fillStyle   = '#FFFFFF';
    ctx.globalAlpha = 0.85;
    Object.entries(sideHandles).forEach(([side, pt]) => {
      const isV = (side === 'top' || side === 'bottom');
      const bw  = isV ? 36 : 6;
      const bh  = isV ? 6  : 36;
      ctx.fillRect(pt.x - bw / 2, pt.y - bh / 2, bw, bh);
    });
  }

  // 모서리 핸들 (원형)
  if (cornerHandles) {
    Object.values(cornerHandles).forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
      ctx.fillStyle   = '#FFFFFF';
      ctx.globalAlpha = 0.95;
      ctx.fill();
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth   = 2.5;
      ctx.globalAlpha = 1;
      ctx.stroke();
    });
  }

  // 안내 텍스트
  ctx.globalAlpha  = 1;
  ctx.shadowColor  = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur   = 10;
  ctx.fillStyle    = '#FFFFFF';
  ctx.font         = 'bold 15px -apple-system, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('모서리·변 드래그로 카드에 맞추고 완료 누르세요', w / 2, 36);

  ctx.restore();
}

// ── 코너 버튼 UI 상태 업데이트 ──
function updateCornerUI() {
  const cornerBtn      = document.getElementById('corner-btn');
  const cornerResetBtn = document.getElementById('corner-reset-btn');
  const captureBtn     = document.getElementById('capture-btn');

  if (isCornerSetupActive()) {
    cornerBtn.textContent      = '취소';
    cornerBtn.classList.add('active');
    cornerResetBtn.textContent = '완료';
    cornerResetBtn.classList.add('visible', 'confirm');
    captureBtn.disabled = true;
  } else if (hasCustomBounds()) {
    cornerBtn.textContent      = '재설정';
    cornerBtn.classList.remove('active');
    cornerResetBtn.textContent = '초기화';
    cornerResetBtn.classList.add('visible');
    cornerResetBtn.classList.remove('confirm');
    captureBtn.disabled = false;
  } else {
    cornerBtn.textContent = '격자크기';
    cornerBtn.classList.remove('active');
    cornerResetBtn.classList.remove('visible', 'confirm');
    captureBtn.disabled = false;
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
      drawCrosshair(ctx, canvas.width, canvas.height, isPhoneLevel());
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

  // 정보 버튼
  document.getElementById('info-btn').addEventListener('click', () => {
    document.getElementById('guide-modal').classList.add('visible');
  });

  document.getElementById('guide-close-btn').addEventListener('click', () => {
    document.getElementById('guide-modal').classList.remove('visible');
  });

  document.getElementById('guide-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('guide-modal')) {
      document.getElementById('guide-modal').classList.remove('visible');
    }
  });

  // 캡처 버튼 — 즉시 저장 후 공유 선택
  document.getElementById('capture-btn').addEventListener('click', async () => {
    const btn = document.getElementById('capture-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      capturedBlob = await captureFrame();
      btn.classList.remove('loading');
      btn.disabled = false;

      // 즉시 갤러리에 저장
      const saved = await downloadImage(capturedBlob);
      if (saved) {
        showToast('저장됐어요 ✓');
      }
      // 공유 선택 모달 표시
      document.getElementById('action-modal').classList.add('visible');
    } catch (err) {
      btn.classList.remove('loading');
      btn.disabled = false;
      showToast('다시 시도해요', 'error');
      console.error('[센터툴] 캡처 오류:', err);
    }
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
      const canvas = document.getElementById('overlay');
      startCornerSetup(canvas.width, canvas.height);
    }
    updateCornerUI();
  });

  // 완료(설정 중) / 초기화(설정 후) 버튼
  document.getElementById('corner-reset-btn').addEventListener('click', () => {
    if (isCornerSetupActive()) {
      finalizeCornerSetup();
      updateCornerUI();
      showToast('카드 위치 설정 완료 ✓');
    } else {
      resetCustomBounds();
      updateCornerUI();
      showToast('자동 모드로 전환됐어요');
    }
  });

  // 드래그 시작
  document.addEventListener('touchstart', (e) => {
    if (!isCornerSetupActive()) return;
    if (e.target.closest('#control-bar') || e.target.closest('#ad-banner')) return;
    e.preventDefault();

    const touch  = e.touches[0];
    const canvas = document.getElementById('overlay');
    const rect   = canvas.getBoundingClientRect();
    startDrag(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  // 드래그 중
  document.addEventListener('touchmove', (e) => {
    if (!isCornerSetupActive() || !isDragging()) return;
    e.preventDefault();

    const touch  = e.touches[0];
    const canvas = document.getElementById('overlay');
    const rect   = canvas.getBoundingClientRect();
    moveDrag(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  // 드래그 종료
  document.addEventListener('touchend', () => {
    if (isCornerSetupActive()) endDrag();
  });

  // 권한 허용 버튼
  const permBtn = document.getElementById('request-permission-btn');
  if (permBtn) {
    permBtn.addEventListener('click', async () => {
      currentSettings = loadSettings();
      const ok = await startCamera();
      if (ok) {
        showApp();
      } else {
        permBtn.textContent = '다시 시도';
        permBtn.style.borderColor = 'var(--error)';
        permBtn.style.color = 'var(--error)';
      }
    });
  }
}

// ── 시작 ──
document.addEventListener('DOMContentLoaded', init);

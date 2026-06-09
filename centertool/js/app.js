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
    document.getElementById('desktop-screen').style.display = 'flex';
    document.getElementById('permission-screen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
    return;
  }

  // 설정 불러오기
  currentSettings = loadSettings();

  // 카메라 시작
  const ok = await startCamera();

  if (!ok) {
    document.getElementById('permission-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    return;
  }

  showApp();
}

// ── 앱 화면 표시 ──
function showApp() {
  document.getElementById('permission-screen').style.display = 'none';
  document.getElementById('desktop-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  setupCanvas();
  updateLevelButtons(currentSettings.grid_level);
  startRenderLoop();

  if (!eventsBound) {
    setupEventListeners();
    eventsBound = true;
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

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentSettings.guide_visible) {
      drawCornerGuides(ctx, canvas.width, canvas.height, currentSettings.grid_color);
    }

    drawGrid(ctx, currentSettings.grid_level, canvas.width, canvas.height, currentSettings.grid_color);

    if (currentSettings.crosshair_visible) {
      drawCrosshair(ctx, canvas.width, canvas.height);
    }

    animationId = requestAnimationFrame(render);
  }

  render();
}

// ── 레벨 버튼 UI 업데이트 ──
function updateLevelButtons(activeLevel) {
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === activeLevel);
  });
}

// ── 토스트 표시 ──
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = type;
  toast.style.display = 'block';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2000);
}

// ── 이벤트 리스너 ──
function setupEventListeners() {

  // 레벨 버튼 클릭
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSettings.grid_level = btn.dataset.level;
      saveSettings(currentSettings);
      updateLevelButtons(btn.dataset.level);
    });
  });

  // 캡처 버튼
  document.getElementById('capture-btn').addEventListener('click', async () => {
    const btn = document.getElementById('capture-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      capturedBlob = await captureFrame();
      btn.classList.remove('loading');
      btn.disabled = false;
      // 액션 모달 표시
      document.getElementById('action-modal').style.display = 'flex';
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
    document.getElementById('action-modal').style.display = 'none';
    const ok = await saveImage(capturedBlob);
    showToast(ok ? '저장됐어요 ✓' : '다시 시도해요', ok ? 'success' : 'error');
    capturedBlob = null;
  });

  // 공유 버튼
  document.getElementById('share-btn').addEventListener('click', async () => {
    if (!capturedBlob) return;
    document.getElementById('action-modal').style.display = 'none';
    const ok = await shareImage(capturedBlob);
    if (ok) showToast('공유됐어요 ✓');
    capturedBlob = null;
  });

  // 취소 버튼
  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('action-modal').style.display = 'none';
    capturedBlob = null;
  });

  // 모달 바깥 클릭 시 닫기
  document.getElementById('action-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('action-modal')) {
      document.getElementById('action-modal').style.display = 'none';
      capturedBlob = null;
    }
  });

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

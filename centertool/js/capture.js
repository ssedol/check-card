// ==========================================
// capture.js — FEAT-3: 화면 캡처 + 저장 + 공유
// Canvas 합성 → Blob → 갤러리 저장 or Web Share API
// ==========================================

/**
 * 현재 카메라 프레임 + 격자 + 가이드를 합성하여 Blob 반환
 * @returns {Promise<Blob>}
 */
async function captureFrame() {
  const video = document.getElementById('video');
  const settings = loadSettings();

  // 오프스크린 Canvas 생성
  const offscreen = document.createElement('canvas');

  // 실제 비디오 해상도 사용 (없으면 화면 크기)
  offscreen.width  = video.videoWidth  || window.innerWidth;
  offscreen.height = video.videoHeight || window.innerHeight;

  const ctx = offscreen.getContext('2d');

  // 1단계: 비디오 현재 프레임 그리기
  ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);

  // 2단계: 격자 오버레이 (FEAT-1)
  drawGrid(ctx, settings.grid_level, offscreen.width, offscreen.height, settings.grid_color);

  // 3단계: L자 코너 가이드 (FEAT-2)
  if (settings.guide_visible) {
    drawCornerGuides(ctx, offscreen.width, offscreen.height, settings.grid_color);
  }

  // 4단계: 중앙 십자선 (FEAT-2)
  if (settings.crosshair_visible) {
    drawCrosshair(ctx, offscreen.width, offscreen.height);
  }

  return new Promise((resolve, reject) => {
    offscreen.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob 실패'));
    }, 'image/png');
  });
}

/**
 * 이미지를 기기 갤러리에 저장한다
 * iOS: Web Share API 사용 / Android + fallback: <a download>
 * @param {Blob} blob
 * @returns {Promise<boolean>}
 */
async function saveImage(blob) {
  const filename = `centertool_${Date.now()}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  // iOS Safari: Web Share API로 저장
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: '센터툴 센터링 측정' });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
      // 실패 시 다운로드 폴백으로 이어짐
    }
  }

  // Android / 데스크탑 폴백: <a download>
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('[센터툴] 저장 실패:', err);
    return false;
  }
}

/**
 * 이미지를 카카오톡 등으로 공유한다 (Web Share API)
 * @param {Blob} blob
 * @returns {Promise<boolean>}
 */
async function shareImage(blob) {
  const filename = `centertool_${Date.now()}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: '센터툴 센터링 측정',
      });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false; // 사용자가 취소
      console.warn('[센터툴] share 실패, 저장으로 전환:', err);
    }
  }

  // Web Share API 미지원 시 저장으로 폴백
  return await saveImage(blob);
}

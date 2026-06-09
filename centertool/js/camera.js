// ==========================================
// camera.js — 카메라 스트림 관리 (FEAT-1 기반)
// MediaDevices.getUserMedia API 사용
// ==========================================

let videoStream = null;

/**
 * 카메라를 시작한다 (후면 카메라 우선)
 * @returns {Promise<boolean>} 성공 여부
 */
async function startCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' }, // 후면 카메라 우선
        width:  { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    videoStream = await navigator.mediaDevices.getUserMedia(constraints);

    const video = document.getElementById('video');
    video.srcObject = videoStream;

    // iOS Safari: play() 명시 호출 필요
    await video.play();

    return true;
  } catch (err) {
    console.error('[센터툴] 카메라 시작 실패:', err);
    videoStream = null;
    return false;
  }
}

/**
 * 카메라를 정지하고 스트림을 해제한다
 */
function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  const video = document.getElementById('video');
  if (video) video.srcObject = null;
}

/**
 * 현재 카메라 스트림 반환
 * @returns {MediaStream|null}
 */
function getVideoStream() {
  return videoStream;
}

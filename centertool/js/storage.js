// ==========================================
// storage.js — Settings 엔티티 관리
// 로컬 스토리지 읽기/쓰기 (FEAT-1, FEAT-2 설정 저장)
// ==========================================

const STORAGE_KEY = 'centertool_settings';

const DEFAULT_SETTINGS = {
  grid_level: 'lv2',
  grid_color: '#FF6B00',
  grid_opacity: 0.7,
  guide_visible: true,
  crosshair_visible: true,
  updated_at: new Date().toISOString()
};

/**
 * 설정 저장
 * @param {Object} settings - 저장할 설정 객체
 * @returns {boolean} 저장 성공 여부
 */
function saveSettings(settings) {
  try {
    const toSave = {
      ...DEFAULT_SETTINGS,
      ...settings,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (e) {
    console.warn('[센터툴] 설정 저장 실패 — 기본값 유지:', e);
    return false;
  }
}

/**
 * 설정 불러오기
 * @returns {Object} 저장된 설정 (없으면 기본값)
 */
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    // 기본값과 병합 (누락된 필드 보완)
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('[센터툴] 설정 불러오기 실패 — 기본값 적용:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

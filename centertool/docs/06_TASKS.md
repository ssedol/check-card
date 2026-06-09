# 센터툴 (CenterTool) — TASKS
> 프로젝트명: 센터툴 (CenterTool) | 버전: v1.1 | 생성일: 2026-06-09 KST  
> 업데이트: 2026-06-09 — 광고 영역 예약(M4)과 실제 광고 연동(M6) 분리, Vercel 배포 확정  
> 작성 기준: SSOT (FEAT-1/2/3, 엔티티: Settings, PRD/TRD/UserFlow/ERD/DesignSystem 참조)

---

## 마일스톤 개요

| 마일스톤 | 목표 | 주요 산출물 | 우선순위 |
|----------|------|-----------|--------|
| M0 | 프로젝트 기반 셋업 | 폴더 구조 + PWA 필수 파일 | 필수 |
| M1 | FEAT-1: 카메라 + 격자 오버레이 | 카메라 스트림 + Canvas 격자 렌더링 | 필수 |
| M2 | FEAT-2: L자 가이드 + 중앙 십자선 | 정렬 가이드 오버레이 | 필수 |
| M3 | 컨트롤 바 UI + 설정 저장 | 레벨 선택 버튼 + 로컬 스토리지 연동 | 필수 |
| M4 | FEAT-3: 캡처 + 저장 + 공유 + **광고 영역 예약** | 캡처 기능 + Web Share API + 빈 광고 컨테이너 | 필수 |
| M5 | Vercel 배포 + 최종 검증 | 라이브 HTTPS PWA URL (iPhone 12 Mini 검증) | 필수 |
| M6 | Google AdSense 실제 연동 | 하단 배너 + 저장 시 인터스티셜 광고 활성화 | **후순위** (트래픽 확보 후) |

> **M6 착수 조건:** Vercel 배포 완료 + 트래픽 발생 + Google AdSense 승인 후 진행

---

## M0 — 프로젝트 기반 셋업

### TASK-001: 폴더 구조 및 기본 파일 생성

**컨텍스트 / 목표**  
개발 파트너가 즉시 착수할 수 있도록 센터툴의 전체 폴더 구조와 PWA 필수 파일을 생성한다.  
이후 모든 TASK의 기반이 된다.

**연결 FEAT**  
FEAT-1 / FEAT-2 / FEAT-3 전체 기반

**기술 명세 (고수준)**  
- 단일 HTML 파일 중심 구조 (`index.html`)
- PWA 필수: `manifest.json` (앱 이름, 아이콘, 배경색 `#000000`, 테마색 `#FF6B00`)
- PWA 필수: `service-worker.js` (앱 파일 전체 캐싱 — 오프라인 작동)
- CSS: 단일 파일 `style.css`
- JS: 기능 단위 모듈 분리
  - `js/camera.js` — 카메라 스트림 관리 (FEAT-1 기반)
  - `js/grid.js` — 격자 렌더링 (FEAT-1 핵심)
  - `js/guide.js` — L자 가이드 + 십자선 (FEAT-2)
  - `js/capture.js` — 캡처 + 저장 + 공유 (FEAT-3)
  - `js/storage.js` — 로컬 스토리지 읽기/쓰기 (Settings 엔티티)
- 아이콘: `icons/icon-192.png`, `icons/icon-512.png` (검정 배경 + 주황 격자 디자인)

**인수 조건 (Acceptance Criteria)**  
- [ ] `index.html`을 브라우저로 열면 검정 화면이 표시된다
- [ ] `manifest.json`이 Chrome DevTools > Application > Manifest에서 오류 없이 인식된다
- [ ] Service Worker가 DevTools > Application > Service Workers에 등록된다
- [ ] 모바일 브라우저에서 "홈 화면에 추가" PWA 설치 배너가 표시된다
- [ ] PC 브라우저로 접속 시 "스마트폰으로 접속해 주세요" 안내가 표시된다

**자가 수정 지침**  
1. 체크: PWA 아이콘이 홈 화면에 정상 표시되는가?
2. 불일치 수정: `manifest.json`의 `icons` 경로 재확인
3. 재검증: Chrome DevTools Application 패널에서 오류 없음 확인

**참조 섹션**  
- TRD §2 기술 스택 | TRD §7 배포/호스팅 | Coding Convention §1 프로젝트 구조

---

## M1 — FEAT-1: 카메라 + 격자 오버레이

### TASK-101: 카메라 스트림 실행

**컨텍스트 / 목표**  
앱 실행 즉시 후면 카메라가 풀스크린으로 켜진다.  
카메라 권한 거부 시 권한 안내 화면으로 전환된다.

**연결 FEAT**  
FEAT-1 (전제 조건)

**기술 명세 (고수준)**  
- `js/camera.js`에 `startCamera()` 함수 작성
- `MediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`로 후면 카메라 요청
- `<video>` 태그를 풀스크린 배경으로 표시 (CSS `object-fit: cover`)
- 권한 거부 시 `#permission-screen` 요소 표시 (Design System § 권한 안내 화면)
- 화면 방향 세로 고정 (CSS `orientation` 미디어 쿼리)

**인수 조건**  
- [ ] 앱 실행 즉시 카메라 권한 요청 팝업이 표시된다
- [ ] 허용 시 후면 카메라 화면이 풀스크린으로 표시된다
- [ ] 거부 시 권한 안내 화면(검정 + 카메라 아이콘 + 안내 문구)이 표시된다
- [ ] 카메라 로딩에서 표시까지 2초 이내다

**자가 수정 지침**  
1. 체크: 실제 스마트폰에서 카메라가 켜지는가?
2. 불일치: iOS Safari에서 안 열리면 → HTTPS 배포 환경에서 테스트 (localhost 불가)
3. 재검증: Android + iOS 각각 테스트

**참조**  
- TRD §2 카메라 API | TRD §5 접근제어  
- Design System §7 권한 안내 화면  
- User Flow: CAM_CHECK 노드

---

### TASK-102: Canvas 격자 오버레이 렌더링 (FEAT-1 핵심)

**컨텍스트 / 목표**  
카메라 영상 위에 Canvas 레이어를 겹쳐 격자를 실시간으로 렌더링한다.

**연결 FEAT**  
FEAT-1 (핵심 구현)

**기술 명세 (고수준)**  
- `js/grid.js`에 `drawGrid(level)` 함수 작성
- `<canvas>`를 `<video>` 위에 `position: absolute`로 겹침 (`z-index` 관리)
- `requestAnimationFrame`으로 60fps 렌더링 루프 구성
- 격자 셀 크기: Lv.1=40px, Lv.2=20px, Lv.3=8px
- 격자 색상: `#FF6B00`, 투명도: 0.7 (Design System §3 참조)
- 기본값: `storage.js`에서 저장된 레벨 읽기, 없으면 lv2 적용

**인수 조건**  
- [ ] 카메라 화면 위에 주황 격자가 오버레이된다
- [ ] 격자가 카드 아래 내용을 완전히 가리지 않는다 (투명도 70%)
- [ ] 렌더링 지연이 눈에 띄지 않는다 (16ms 이하 목표)
- [ ] Lv.1/2/3 전환 시 격자 크기가 즉시 변경된다

**자가 수정 지침**  
1. 체크: Canvas가 video 위에 정확히 겹쳐있는가?
2. 불일치: Canvas 크기가 video 크기와 일치하는지 확인 (resize 이벤트 처리)
3. 재검증: 가로/세로 각각 테스트

**참조**  
- TRD §1 시스템 아키텍처 (Canvas API)  
- Design System §3 격자 레벨 스펙  
- User Flow: FEAT-1 노드

---

## M2 — FEAT-2: L자 가이드 + 중앙 십자선

### TASK-201: L자 코너 가이드 렌더링 (FEAT-2)

**컨텍스트 / 목표**  
카드 네 모서리를 맞출 수 있는 L자 가이드를 Canvas에 렌더링한다.  
포켓몬 카드의 실제 비율(63mm × 88mm = 약 5:7)에 맞게 위치를 계산한다.

**연결 FEAT**  
FEAT-2 (핵심 구현)

**기술 명세 (고수준)**  
- `js/guide.js`에 `drawCornerGuides()` 함수 작성
- 화면 유효 영역 = 전체 높이 - 컨트롤 바(56px) - 배너(50px)
- 카드 가이드 영역: 유효 영역 내에서 5:7 비율로 중앙 배치
- L자 마커: 각 변 길이 48px, 선 굵기 3px, 색상 `#FF6B00`
- 4개 코너 각각 상좌/상우/하좌/하우 방향으로 L자 그리기

**인수 조건**  
- [ ] 화면 유효 영역 4개 코너에 주황 L자 마커가 표시된다
- [ ] L자 마커가 컨트롤 바와 배너 영역을 침범하지 않는다
- [ ] 실제 포켓몬 카드를 들고 맞춰보았을 때 모서리가 L자 안에 들어온다

**자가 수정 지침**  
1. 체크: 실제 포켓몬 카드로 L자 맞추기 테스트
2. 불일치: 가이드 크기/위치 수식 재계산
3. 재검증: 다른 크기의 스마트폰에서도 비율이 유지되는지 확인

**참조**  
- Design System §6 레이아웃 구조 | Design System §7 L자 코너 가이드  
- Database Design: Settings.guide_visible  
- User Flow: FEAT-2 노드

---

### TASK-202: 중앙 십자선 렌더링 (FEAT-2)

**컨텍스트 / 목표**  
화면 정중앙에 십자선과 원을 표시하여 카드 중심 확인을 돕는다.  
물리 CENTER TOOL의 중앙 마커를 재현한다.

**연결 FEAT**  
FEAT-2 (보조 구현)

**기술 명세 (고수준)**  
- `js/guide.js`에 `drawCrosshair()` 함수 추가
- 중심 좌표: 화면 유효 영역의 정중앙
- 십자선: 수평선 + 수직선, 색상 `#FFFFFF`, 굵기 1px, 길이 각 화면 크기의 10%
- 중앙 원: 반지름 8px, `#FFFFFF`, 채우기 없음 (stroke only)

**인수 조건**  
- [ ] 화면 정중앙에 흰색 십자선과 빈 원이 표시된다
- [ ] 십자선이 물리 CENTER TOOL의 중앙 마커와 시각적으로 유사하다
- [ ] L자 가이드와 중앙 십자선이 동시에 표시된다

**참조**  
- Design System §1 컬러 (Crosshair) | Design System §7 중앙 십자선  
- Database Design: Settings.crosshair_visible

---

## M3 — 컨트롤 바 UI + 설정 저장

### TASK-301: 하단 컨트롤 바 UI 구현

**컨텍스트 / 목표**  
화면 하단에 격자 레벨 선택 버튼(L1/L2/L3)과 캡처 버튼이 있는 컨트롤 바를 배치한다.

**기술 명세 (고수준)**  
- `index.html`에 컨트롤 바 요소 추가 (`position: fixed; bottom: 50px;` — 배너 위)
- 레벨 버튼 3개: 텍스트 "L1" "L2" "L3", 현재 활성 레벨은 주황 테두리 + 배경 적용
- 캡처 버튼: 우측 고정, 56px 원형, 흰색 배경, 카메라 아이콘
- 배너 영역: `position: fixed; bottom: 0; height: 50px;` 광고 컨테이너

**인수 조건**  
- [ ] 컨트롤 바가 카메라 화면과 배너 사이에 고정 표시된다
- [ ] 활성 레벨 버튼이 시각적으로 구분된다 (주황 테두리)
- [ ] 모든 버튼의 터치 영역이 44px × 44px 이상이다
- [ ] 컨트롤 바가 카메라 화면을 가리지 않는다 (카메라 영역 높이 자동 조정)

**참조**  
- Design System §6 레이아웃 구조 | Design System §7 컴포넌트

---

### TASK-302: 로컬 스토리지 연동 (Settings 엔티티)

**컨텍스트 / 목표**  
사용자가 선택한 격자 레벨을 로컬 스토리지에 저장하고, 재방문 시 자동으로 불러온다.

**기술 명세 (고수준)**  
- `js/storage.js`에 `saveSettings(settings)` / `loadSettings()` 함수 작성
- 저장 키: `centertool_settings` (단일 JSON 객체)
- 저장 시점: 레벨 버튼 클릭 즉시
- 불러오기 시점: 앱 초기화(`DOMContentLoaded`) 시
- 로컬 스토리지 접근 실패 시 기본값(lv2)으로 폴백

**인수 조건**  
- [ ] 레벨 선택 후 앱을 껐다 켜도 동일 레벨이 적용된다
- [ ] 브라우저 개발자 도구 > Application > Local Storage에서 `centertool_settings` 키가 확인된다
- [ ] 로컬 스토리지 접근 실패 시에도 앱이 정상 작동한다 (기본값 lv2 적용)

**참조**  
- Database Design: Settings 엔티티 | TRD §4 데이터 저장 원칙  
- User Flow: SAVE_SETTING 노드 | User Flow: LOAD 노드 (리텐션 루프)

---

## M4 — FEAT-3: 캡처 + 저장 + 공유 + 광고 영역 예약

> **이 마일스톤의 범위:** FEAT-3 기능 완성 + 광고 컨테이너 HTML 자리 예약만.  
> 실제 AdSense 코드 삽입은 M6에서 처리한다.

### TASK-401: 화면 캡처 기능 (FEAT-3 핵심)

**컨텍스트 / 목표**  
격자 오버레이와 L자 가이드가 포함된 현재 화면을 이미지 파일로 캡처한다.  
캡처된 이미지는 공유 및 저장에 사용된다.

**연결 FEAT**  
FEAT-3 (핵심 구현)

**기술 명세 (고수준)**  
- `js/capture.js`에 `captureFrame()` 함수 작성
- 별도의 오프스크린 Canvas 생성 (화면에 표시되지 않음)
- `drawImage(videoElement)` → 현재 카메라 프레임 복사
- `drawGrid()` + `drawCornerGuides()` + `drawCrosshair()` 순서로 합성
- `canvas.toBlob('image/png')` → Blob 데이터 생성
- 캡처 중 로딩 애니메이션 표시 (캡처 버튼 회전)

**인수 조건**  
- [ ] 캡처 버튼 탭 시 격자 + L자 가이드 + 십자선이 포함된 이미지가 생성된다
- [ ] 캡처 이미지 배경에 카메라 화면이 포함된다
- [ ] 이미지가 검정으로만 나오지 않는다 (video 프레임 복사 타이밍 이슈 없음)

**자가 수정 지침**  
1. 체크: 캡처 이미지를 갤러리에서 열어 격자가 보이는가?
2. 불일치: `drawImage` 타이밍 문제면 `requestAnimationFrame` 콜백 내에서 캡처
3. 재검증: Lv.1/2/3 각각에서 캡처 후 이미지 확인

**참조**  
- TRD §1 Canvas API | User Flow: FEAT-3 노드

---

### TASK-402: 저장 + 공유 통합 (FEAT-3)

**컨텍스트 / 목표**  
캡처 완료 후 갤러리 저장 또는 카카오톡 공유를 실행한다.  
저장 완료 시 성공 토스트를 표시한다.  
광고는 이 단계에서 연동하지 않는다 — M6에서 처리.

**연결 FEAT**  
FEAT-3 (저장/공유)

**기술 명세 (고수준)**  
- 캡처 완료 후: 저장 / 공유 / 취소 선택 UI 표시 (모달 또는 액션 시트)
- 갤러리 저장: `URL.createObjectURL(blob)` + `<a download="centertool_capture.png">` 방식
  - iOS 저장 실패 시: Web Share API로 자동 전환 (폴백)
- 카카오톡 공유: `navigator.share({ files: [new File([blob], 'centertool.png')] })`
  - Web Share API 미지원 기기: `<a download>` 방식으로 폴백
- 완료 후: 성공 토스트 2초 표시

**인수 조건**  
- [ ] 캡처 완료 후 저장 / 공유 / 취소 선택 UI가 표시된다
- [ ] 갤러리 저장 선택 시 기기 사진 앱에 이미지가 저장된다
- [ ] 공유 선택 시 스마트폰 공유 시트가 열리고 카카오톡이 옵션에 포함된다
- [ ] 저장/공유 완료 후 "저장됐어요 ✓" 토스트가 2초간 표시된다
- [ ] 취소 선택 시 카메라 화면으로 돌아간다

**자가 수정 지침**  
1. 체크: iPhone 12 Mini에서 저장 후 사진 앱에 이미지가 나타나는가?
2. 불일치: iOS 저장 실패 시 Web Share API 폴백이 자동 실행되는가?
3. 재검증: 저장 → 카카오톡 공유 순서로 각각 테스트

**참조**  
- TRD §8 외부 API (Web Share API) | Design System §7 토스트 알림  
- PRD §5 가드레일 지표 | User Flow: SAVE_SHARE 노드

---

### TASK-403: 광고 영역 HTML 예약 (자리만 잡기)

**컨텍스트 / 목표**  
나중에 Google AdSense 코드를 한 줄만 넣으면 바로 광고가 뜨도록,  
지금은 빈 컨테이너 HTML 구조와 CSS 영역만 잡아둔다.  
실제 광고 코드는 M6에서 삽입한다.

**기술 명세 (고수준)**  
- `index.html` 하단에 광고 컨테이너 div 추가
  - 하단 배너 컨테이너: `id="ad-banner"`, 높이 50px, 배경 `#1A1A1A`, 하단 fixed
  - 인터스티셜 컨테이너: `id="ad-interstitial"`, 전체화면 오버레이, 기본값 `display:none`
- `style.css`에 두 컨테이너 스타일 정의
- 지금은 안에 내용 없음 — 빈 div
- 카메라 유효 영역 높이 계산 시 배너 50px 이미 포함하여 계산 (L자 가이드 겹침 방지)

**인수 조건**  
- [ ] 하단에 50px 높이의 빈 검정 영역이 표시된다
- [ ] 빈 광고 영역이 컨트롤 바나 카메라 화면을 가리지 않는다
- [ ] L자 가이드 하단 코너가 광고 영역 위에 위치한다
- [ ] `id="ad-banner"` 안에 AdSense `<script>` 한 줄을 넣으면 바로 광고가 뜨는 구조다

**참조**  
- Design System §6 레이아웃 구조 (배너 50px 영역)  
- M6 TASK-601 (실제 AdSense 연동)

---

## M5 — Vercel 배포 + 최종 검증

### TASK-501: Vercel 배포

**컨텍스트 / 목표**  
완성된 센터툴을 Vercel로 배포하여 HTTPS URL을 확보하고,  
친구(iPhone 12 Mini)가 즉시 접속할 수 있도록 한다.

**기술 명세 (고수준)**  
- GitHub 저장소 생성 → `main` 브랜치에 전체 파일 push
- Vercel 계정 생성 → GitHub 저장소 연결 → 자동 배포
- 배포 완료 시 `https://프로젝트명.vercel.app` URL 자동 생성
- 커스텀 도메인은 이후에 별도 연결 (지금은 Vercel 기본 URL 사용)
- Service Worker가 HTTPS 환경에서 정상 등록되는지 확인

**인수 조건**  
- [ ] `https://xxx.vercel.app` URL로 외부에서 접속 가능하다
- [ ] iPhone 12 Mini Safari에서 카메라 권한 요청이 정상 표시된다
- [ ] PWA "홈 화면에 추가" 배너가 표시된다
- [ ] 오프라인 상태에서 앱이 실행된다 (Service Worker 캐싱)
- [ ] GitHub `main` 브랜치 push 시 Vercel 자동 재배포가 확인된다

**참조**  
- TRD §7 배포/호스팅 | Coding Convention §4 디버깅 워크플로우

---

### TASK-502: 최종 기기 검증 시나리오

**컨텍스트 / 목표**  
실제 포켓몬 카드와 iPhone 12 Mini로 전체 시나리오를 검증한다.  
친구가 직접 사용해보고 피드백을 받는다.

**7단계 검증 시나리오**  
1. iPhone 12 Mini로 Vercel URL 접속 → PWA 설치 시도
2. 카메라 권한 허용 → 카메라 화면 + L자 가이드 표시 확인
3. Lv.3 선택 → 촘촘한 격자 실제 확인
4. 실제 포켓몬 카드를 L자 가이드에 맞춤 → 센터링 확인
5. 캡처 버튼 탭 → 저장 선택 → 사진 앱에 이미지 저장 확인
6. 앱 종료 후 재실행 → Lv.3 설정이 유지되는지 확인
7. 캡처 이미지를 카카오톡으로 공유 → 이미지에 격자 포함 확인

**인수 조건**  
- [ ] 7개 시나리오 모두 iPhone 12 Mini에서 오류 없이 완료된다
- [ ] 친구(실제 사용자)가 "이게 물리 툴보다 낫다"고 인정한다
- [ ] 캡처 이미지에서 격자와 L자 가이드가 명확하게 보인다
- [ ] 하단 광고 영역(빈 상태)이 카메라 화면이나 컨트롤 바를 침범하지 않는다

---

## M6 — Google AdSense 실제 연동 (후순위)

> **착수 조건:** Vercel 배포 완료 + 실제 트래픽 발생 + Google AdSense 계정 승인  
> AdSense는 신규 사이트 승인에 수 주가 걸릴 수 있다. 미리 신청해두는 것을 권장.

### TASK-601: Google AdSense 신청 및 승인 대기

**컨텍스트 / 목표**  
M5 배포 완료 후 AdSense 신청을 제출하고 승인을 기다린다.  
이 TASK는 개발 작업이 아닌 계정/정책 작업이다.

**진행 순서**  
1. Google AdSense 계정 생성 (ads.google.com)
2. 센터툴 Vercel URL 등록
3. AdSense 확인 코드(`<script>`)를 `index.html` `<head>`에 삽입
4. 심사 제출 → 승인 대기 (보통 수일 ~ 수주 소요)

**인수 조건**  
- [ ] AdSense 계정이 생성되고 사이트가 등록된다
- [ ] 확인 코드가 `index.html`에 삽입된다
- [ ] AdSense 대시보드에서 "승인됨" 상태가 확인된다

---

### TASK-602: 하단 배너 광고 활성화

**컨텍스트 / 목표**  
TASK-403에서 예약해둔 `id="ad-banner"` 컨테이너에  
AdSense 배너 광고 코드를 삽입하여 실제 광고를 표시한다.

**기술 명세 (고수준)**  
- AdSense 승인 후 발급받은 배너 광고 단위 코드를 `id="ad-banner"` 안에 삽입
- 광고 단위 크기: 320×50 (모바일 배너 표준)
- 광고 로드 실패 시 빈 영역 유지 (높이 50px 고정)

**인수 조건**  
- [ ] 하단 50px 영역에 광고가 표시된다
- [ ] 광고가 카메라 화면이나 컨트롤 바를 가리지 않는다
- [ ] 광고 로드 실패 시에도 레이아웃이 깨지지 않는다

**참조**  
- TASK-403 (광고 영역 예약) | Design System §6 레이아웃 구조

---

### TASK-603: 저장 시 인터스티셜 광고 활성화

**컨텍스트 / 목표**  
캡처 후 저장/공유 선택 전에 전면 광고 1회를 표시한다.  
TASK-402의 저장 플로우 앞에 광고 스텝을 삽입한다.

**기술 명세 (고수준)**  
- `js/capture.js`의 저장 플로우에 광고 표시 단계 추가
- `id="ad-interstitial"` 컨테이너를 `display:flex`로 전환
- AdSense 전면 광고 단위 코드 삽입 (또는 AdSense 자동 광고 활용)
- 3초 후 닫기 버튼 활성화 → 닫으면 저장/공유 선택 UI 표시

**인수 조건**  
- [ ] 캡처 후 전면 광고가 3초간 표시된다
- [ ] 3초 후 닫기 버튼이 활성화된다
- [ ] 광고 닫기 후 저장/공유 선택 UI가 정상 표시된다
- [ ] 캡처 후 공유 완료율이 70% 이상 유지된다 (PRD 가드레일 지표)

**참조**  
- PRD §5 가드레일 지표 | TASK-402 | User Flow: AD_INTERSTITIAL 노드

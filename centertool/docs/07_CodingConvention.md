# 센터툴 (CenterTool) — Coding Convention & AI Collaboration Guide
> 프로젝트명: 센터툴 (CenterTool) | 버전: v1.0 | 생성일: 2026-06-09 KST

---

## 핵심 원칙: "신뢰하되, 검증하라"

AI 코딩 파트너(Cursor, Claude, ChatGPT 등)가 코드를 작성해주지만,  
**모든 코드는 실제 스마트폰 기기에서 직접 테스트해야 한다.**

AI가 그럴듯해 보이는 코드를 작성해도,  
카메라 API와 Web Share API는 브라우저/기기/OS 버전마다 동작이 다를 수 있다.

---

## 1. 프로젝트 구조 원칙

### 폴더 구조 개요

```
centertool/
├── index.html            ← 앱의 단 하나의 HTML 파일. 모든 것의 시작점
├── style.css             ← 모든 시각 디자인 (Design System 기반)
├── manifest.json         ← PWA 설치 정보 (앱 이름, 아이콘, 배경색/테마색)
├── service-worker.js     ← 오프라인 캐싱 담당
├── js/
│   ├── camera.js         ← 카메라 켜기/끄기/권한 처리 담당 (FEAT-1 기반)
│   ├── grid.js           ← 격자 그리기 담당 (FEAT-1 핵심)
│   ├── guide.js          ← L자 가이드 + 중앙 십자선 그리기 (FEAT-2)
│   ├── capture.js        ← 화면 캡처 + 저장 + 공유 담당 (FEAT-3)
│   └── storage.js        ← 로컬 스토리지 읽기/쓰기 (Settings 엔티티)
└── icons/
    ├── icon-192.png      ← PWA 아이콘 소형 (홈 화면)
    └── icon-512.png      ← PWA 아이콘 대형 (스플래시)
```

### 모듈성 원칙

- **1파일 1역할:** 각 JS 파일은 하나의 기능만 담당한다. 섞지 않는다.
- **FEAT 단위 파일:** FEAT-1 = `grid.js`, FEAT-2 = `guide.js`, FEAT-3 = `capture.js`
- **공용 모듈 분리:** `storage.js`는 어느 파일에서든 불러쓸 수 있어야 한다.
- **index.html 오염 금지:** HTML에 JS 로직을 직접 작성하지 않는다. 반드시 JS 파일로 분리.
- **style.css 오염 금지:** JS에서 인라인 스타일을 직접 지정하지 않는다. CSS 클래스 토글 방식 사용.

---

## 2. AI 소통 원칙

### 좋은 지시 예시 (이렇게 써)

```
"camera.js 파일에서 MediaDevices.getUserMedia API를 사용해서
 후면 카메라(facingMode: environment)를 video 태그에 연결하는
 startCamera() 함수를 작성해줘.
 카메라 권한 거부 시에는 id가 'permission-screen'인 div를
 display:flex로 변경해야 해."
```

```
"grid.js에서 canvas 요소에 격자를 그리는 drawGrid(level) 함수를 만들어줘.
 level은 1, 2, 3 중 하나야.
 각각 셀 크기는 40px, 20px, 8px이고
 격자 색상은 #FF6B00, 전역 알파는 0.7이야.
 requestAnimationFrame으로 계속 다시 그려야 해."
```

```
"capture.js에서 현재 video 프레임에 격자와 가이드를 합성하여
 PNG Blob을 반환하는 captureFrame() 비동기 함수를 만들어줘.
 오프스크린 canvas를 새로 생성해서 video → 격자 → 가이드 순서로
 drawImage와 drawGrid, drawCornerGuides를 순서대로 호출해야 해."
```

### 나쁜 지시 예시 (이렇게 쓰지 마)

```
❌ "카메라 기능 만들어줘"
   → 범위가 너무 넓음. 어느 파일인지, 어떤 동작인지 불분명.

❌ "격자 예쁘게 만들어줘"
   → 기준이 없음. 색상, 크기, 투명도를 모두 명시해야 함.

❌ "전체 앱 다 만들어줘"
   → 한 번에 너무 많음. 검증이 불가능해지고 오류 추적도 어려워짐.

❌ "이전이랑 똑같이 해줘"
   → AI는 이전 대화를 기억하지 못할 수 있음. 항상 맥락을 다시 제공.
```

### AI 지시 전 체크리스트

지시를 보내기 전 아래를 확인한다:

- [ ] 어느 파일(`js/grid.js` 등)에 작성할지 명시했는가?
- [ ] 어떤 FEAT(FEAT-1/2/3)와 관련된 작업인지 언급했는가?
- [ ] 함수 이름과 입력값(파라미터), 출력값(반환 타입)이 명확한가?
- [ ] 에러 상황(권한 거부, 저장 실패, API 미지원 등)을 명시했는가?
- [ ] 한 번에 하나의 함수 또는 하나의 기능만 요청했는가?
- [ ] 관련 Design System 수치(색상, 크기 등)를 함께 전달했는가?

---

## 3. 보안 / 환경변수 / 비밀 관리 체크리스트

| 항목 | 원칙 | 확인 시점 |
|------|------|----------|
| HTTPS 배포 | 카메라 API는 보안 컨텍스트 필수 | 배포 시 |
| 광고 Publisher ID | AdSense/AdFit ID는 HTML에 직접 삽입 가능 (서버 없음) | M4 시작 전 |
| 외부 API 키 | 현재 외부 API 키 없음 (Web Share API는 키 불필요) | 현재 없음 |
| 로컬 스토리지 | 개인정보, 위치, 기기 고유값 저장 절대 금지 | 코드 리뷰마다 |
| 외부 스크립트 | AdSense 외 불필요한 외부 스크립트 추가 금지 | 코드 리뷰마다 |
| 사용자 이미지 | 캡처 이미지를 서버로 전송하지 않음 | — |

---

## 4. 테스트 및 디버깅 워크플로우

### 개발 중 테스트 순서

1. **1단계 — PC Chrome에서 확인**  
   Chrome DevTools > 모바일 에뮬레이터로 레이아웃과 기본 동작 확인.  
   단, 카메라는 PC 웹캠이 켜지므로 실제 환경과 다름.

2. **2단계 — 실제 스마트폰에서 확인 (필수)**  
   같은 와이파이로 연결된 스마트폰에서 `http://컴퓨터IP:포트`로 접속.  
   또는 배포 후 HTTPS URL로 접속.

3. **3단계 — iOS Safari 별도 확인 (필수)**  
   iOS는 카메라 API와 Web Share API 동작이 Android와 다르다.  
   반드시 별도 테스트.

### 주요 버그 시나리오 및 해결

| 증상 | 원인 | 해결 방법 |
|------|------|----------|
| 카메라 화면이 검정으로 표시됨 | HTTP 환경에서 카메라 API 차단 | HTTPS 배포 후 테스트 |
| iOS Safari에서 카메라 안 열림 | Safari 개인 정보 보호 설정 | 설정 > Safari > 카메라 > 허용 안내 |
| 격자가 카메라 위에 겹치지 않음 | Canvas z-index 또는 position 문제 | `position: absolute; z-index: 10` 확인 |
| 캡처 이미지가 완전히 검정으로 나옴 | video 프레임 복사 타이밍 문제 | `requestAnimationFrame` 콜백 내에서 `drawImage` 호출 |
| 갤러리 저장이 iOS에서 안 됨 | iOS는 직접 저장 불가 | Web Share API로 자동 전환 (폴백) |
| Web Share API가 작동 안 함 | 구형 Android 브라우저 미지원 | `<a download>` 방식으로 폴백 |
| PWA 설치 배너가 안 뜸 | manifest 오류 또는 Service Worker 미등록 | Chrome DevTools > Application 패널 확인 |
| 재실행 시 설정이 초기화됨 | 로컬 스토리지 키 이름 불일치 | `centertool_settings` 키 이름 통일 확인 |

---

## 5. Definition of Done (완료 기준)

하나의 TASK가 "완료"되려면 아래를 **모두** 만족해야 한다:

| 기준 | 설명 |
|------|------|
| 인수 조건 통과 | 해당 TASK의 모든 Acceptance Criteria가 체크됨 |
| 실기기 테스트 | PC 에뮬레이터가 아닌 실제 스마트폰에서 테스트됨 |
| 멀티 플랫폼 | iOS 또는 Android 중 최소 하나에서 검증됨 |
| 회귀 없음 | 이전 TASK에서 작동하던 기능이 여전히 작동함 |
| 모듈 분리 | 코드가 해당 JS 모듈 파일에만 작성됨 (다른 파일 오염 없음) |
| 오프라인 | 인터넷 없는 상태에서도 앱이 실행됨 (Service Worker 캐시) |
| SSOT 일치 | 색상/크기/이름이 Design System 및 PRD 용어집과 일치함 |

---

## 6. 자주 하는 실수 방지 목록

| 실수 | 방지 방법 |
|------|----------|
| HTTP에서 카메라 API 테스트 | 항상 localhost(127.0.0.1) 또는 HTTPS에서만 테스트 |
| PC에서만 테스트하고 배포 | 배포 전 반드시 실제 스마트폰으로 확인 |
| 한 파일에 모든 코드 몰아넣기 | JS 모듈 분리 원칙 (1파일 1역할) 반드시 준수 |
| AI 코드 그대로 사용 | 인수 조건 체크리스트 통과 후에만 사용 |
| 광고 코드 넣고 플로우 미확인 | 저장 → 광고 → 완료 전체 플로우 직접 테스트 |
| Canvas 크기를 화면과 다르게 설정 | resize 이벤트 리스너로 Canvas 크기 동기화 |
| iOS와 Android 동일하다고 가정 | 반드시 두 OS에서 별도 테스트 |

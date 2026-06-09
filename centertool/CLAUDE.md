# 센터툴 (CenterTool) — CLAUDE.md
> Claude Code가 이 파일을 자동으로 읽어 프로젝트 컨텍스트를 파악한다

---

## 프로젝트 한 줄 정의
카메라로 포켓몬 카드를 비추면 격자 오버레이로 센터링을 확인하고 캡처/공유하는 모바일 전용 PWA

## 기술 스택
- HTML + CSS + Vanilla JavaScript (프레임워크 없음)
- PWA (manifest.json + service-worker.js)
- 카메라: MediaDevices.getUserMedia API
- 격자 렌더링: HTML5 Canvas API (requestAnimationFrame 60fps)
- 저장: 로컬 스토리지 (Settings 엔티티)
- 공유: Web Share API

## FEAT 식별자
- FEAT-1: 격자 오버레이 (grid.js) — Lv.1(40px) / Lv.2(20px) / Lv.3(8px)
- FEAT-2: L자 코너 가이드 + 중앙 십자선 (guide.js)
- FEAT-3: 캡처 + 갤러리 저장 + 카카오톡 공유 (capture.js)

## 파일 역할
- index.html — 단일 HTML 파일. 모든 것의 시작점
- style.css — Design System 기반 전체 스타일
- manifest.json — PWA 설치 정보
- service-worker.js — 오프라인 캐싱
- js/storage.js — 로컬 스토리지 읽기/쓰기 (Settings 엔티티)
- js/grid.js — FEAT-1 격자 렌더링
- js/guide.js — FEAT-2 L자 가이드 + 십자선
- js/camera.js — 카메라 스트림 관리
- js/capture.js — FEAT-3 캡처 + 저장 + 공유
- js/app.js — 메인 초기화 + 렌더링 루프 + 이벤트

## 핵심 색상 (변경 금지)
- 배경: #000000
- 격자/가이드: #FF6B00 (주황)
- 컨트롤 바: #1A1A1A
- 성공: #00FF88 | 에러: #FF3B30

## 레이아웃 높이 (CSS 변수와 일치)
- 컨트롤 바: 56px (--control-bar-h)
- 광고 배너: 50px (--ad-banner-h)
- 카메라 영역: 나머지 전체

## 절대 하지 말 것
- JS 파일 간 함수를 섞지 않는다 (1파일 1역할)
- 로컬 스토리지에 개인정보 저장하지 않는다
- 로그인/서버 코드를 추가하지 않는다
- CSS에서 컨트롤 바 높이를 하드코딩하지 않는다 (CSS 변수 사용)

## 광고 (M6 후순위 — 지금은 건드리지 않는다)
- #ad-banner: 하단 배너 광고 컨테이너 (현재 빈 상태)
- #ad-interstitial: 전면 광고 컨테이너 (현재 빈 상태)
- AdSense 코드는 M6에서만 삽입한다

## 설계 문서 위치
- docs/01_PRD.md — 요구사항
- docs/02_TRD.md — 기술 요구사항
- docs/03_UserFlow.md — 사용자 흐름
- docs/04_DatabaseDesign.md — 데이터 설계
- docs/05_DesignSystem.md — 디자인 시스템
- docs/06_TASKS.md — 개발 태스크 목록
- docs/07_CodingConvention.md — 코딩 컨벤션

## 작업 방식
TASK 하나씩 순서대로 진행한다.
완료 기준: 인수 조건 체크 → iPhone 12 Mini 실기기 테스트 → 통과 후 다음 TASK

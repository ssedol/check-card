# 센터툴 (CenterTool) — User Flow
> 프로젝트명: 센터툴 (CenterTool) | 버전: v1.0 | 생성일: 2026-06-09 KST  
> 작성 기준: SSOT (FEAT-1/2/3 노드 매칭, 성공/실패 분기, 리텐션 루프 포함)

---

## MVP 핵심 여정 (FEAT-1 + FEAT-2 + FEAT-3 전체)

```mermaid
graph TD
    START([앱 URL 접속 또는 PWA 아이콘 탭]) --> INSTALL{PWA 설치\n배너 표시?}

    INSTALL -->|설치 선택| INSTALLED[홈 화면에 센터툴 추가됨]
    INSTALL -->|건너뜀| CAM_CHECK
    INSTALLED --> CAM_CHECK

    CAM_CHECK{카메라 권한\n허용 상태?}
    CAM_CHECK -->|이미 허용됨| CAMERA
    CAM_CHECK -->|미허용| PERMISSION[권한 요청 안내 화면 표시\n카메라 아이콘 + 안내 문구]

    PERMISSION -->|허용| CAMERA
    PERMISSION -->|계속 거부| ERROR[사용 불가 안내\n브라우저 설정 링크 제공]
    ERROR -->|설정 후 재시도| CAM_CHECK

    CAMERA[카메라 화면 풀스크린 표시\n후면 카메라 스트림]
    CAMERA --> FEAT2[FEAT-2: L자 코너 가이드 4개 표시\n중앙 십자선 + 원 표시]
    FEAT2 --> FEAT1[FEAT-1: 격자 오버레이 활성화\n기본값 Lv.2 또는 저장된 레벨 적용]

    FEAT1 --> LEVEL_UI[컨트롤 바 표시\nLv.1 / Lv.2 / Lv.3 버튼 + 캡처 버튼]

    LEVEL_UI --> SELECT{격자 레벨 선택}
    SELECT -->|Lv.1 탭| LV1[성긴 격자 적용\n셀 크기 40px]
    SELECT -->|Lv.2 탭| LV2[중간 격자 적용\n셀 크기 20px]
    SELECT -->|Lv.3 탭| LV3[촘촘한 격자 적용\n셀 크기 8px]

    LV1 --> SAVE_SETTING[Settings 엔티티\n로컬 스토리지에 레벨값 저장]
    LV2 --> SAVE_SETTING
    LV3 --> SAVE_SETTING

    SAVE_SETTING --> ALIGN[카드를 화면에 배치\nL자 가이드에 네 모서리 맞춤]

    ALIGN --> OK{구도 확인\n센터링 체크}
    OK -->|재조정 필요| ALIGN
    OK -->|확인 완료| CAPTURE_TAP[캡처 버튼 탭]

    CAPTURE_TAP --> FEAT3[FEAT-3: Canvas에 비디오 프레임 합성\n격자 + L자 가이드 + 십자선 포함 이미지 생성]

    FEAT3 --> AD[인터스티셜 광고 표시\n3초 후 닫기 가능]
    AD --> ACTION{저장 / 공유 선택}

    ACTION -->|갤러리 저장| GALLERY[기기 갤러리에 이미지 저장]
    ACTION -->|카카오톡 공유| SHARE[Web Share API 실행\n스마트폰 공유 시트 표시]
    ACTION -->|취소| CAMERA

    GALLERY --> TOAST_OK[성공 토스트 표시\n저장됐어요 ✓ - 2초]
    SHARE --> SHARE_DONE[카카오톡 전송 완료]

    TOAST_OK --> STICKY{계속 찍을까?}
    SHARE_DONE --> STICKY

    STICKY -->|같은 카드 다시| ALIGN
    STICKY -->|다른 카드| CAMERA
    STICKY -->|종료| END([앱 종료 또는 백그라운드])
```

---

## 실패 분기 상세

```mermaid
graph TD
    F1[카메라 권한 거부] --> F1A[권한 안내 화면\n검정 배경 + 카메라 아이콘]
    F1A --> F1B[브라우저 설정 바로가기 버튼]

    F2[캡처 이미지 생성 실패] --> F2A[에러 토스트 표시\n다시 시도해요 - 3초]
    F2A --> F2B[캡처 버튼 재활성화]

    F3[갤러리 저장 실패 iOS] --> F3A[Web Share API로 자동 전환\n공유 시트 표시]

    F4[Web Share API 미지원] --> F4A[다운로드 링크 방식으로 폴백\na download 트릭]

    F5[로컬 스토리지 접근 실패] --> F5A[기본값 Lv.2로 폴백\n설정 저장 없이 계속 작동]
```

---

## 재방문 여정 — 리텐션 루프 (Sticky Loop)

```mermaid
graph TD
    RETURN([재방문\nPWA 아이콘 탭]) --> LOAD[로컬 스토리지에서\nSettings 불러오기]
    LOAD --> AUTO[카메라 화면 즉시 표시\n마지막 격자 레벨 자동 적용]
    AUTO --> ALIGN2[카드 정렬 → 캡처 → 저장/공유]
    ALIGN2 --> VIRAL[카카오톡에 캡처 사진 공유]
    VIRAL --> VIEW[구매자 / 다른 판매자 사진 확인]
    VIEW --> QUESTION[이 격자 어디서 났어?\n앱 뭐야?]
    QUESTION --> URL[URL 공유 또는 직접 전달]
    URL --> NEW([신규 사용자 첫 방문])
```

---

## FEAT ↔ Flow 노드 매핑

| FEAT | 해당 Flow 노드 |
|------|--------------|
| FEAT-1 | 격자 오버레이 활성화, Lv.1/2/3 선택, 로컬 스토리지 저장 |
| FEAT-2 | L자 코너 가이드 표시, 중앙 십자선 표시, 카드 정렬 단계 |
| FEAT-3 | 캡처 버튼 탭 → 이미지 합성 → 인터스티셜 광고 → 갤러리 저장 / Web Share API |

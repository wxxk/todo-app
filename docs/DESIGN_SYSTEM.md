# 디자인 시스템 — Airbnb 스타일 적용

이 앱의 시각 디자인은 Airbnb의 디자인 언어(단일 브랜드 컬러 Rausch, 부드러운 라운드 코너, 절제된 타이포그래피, 라이트 모드 전용)를 토대로 만들어졌다. 원본 토큰 스펙은 아래 참고 섹션에 그대로 보존한다.

## 이 앱에 적용된 매핑

- **컬러**: `app/globals.css`의 `@theme` 블록에 Tailwind 유틸리티로 정의됨 (`bg-primary`, `text-ink`, `border-hairline` 등). 다크 모드 없음 — Airbnb 원본도 라이트 전용.
- **타이포그래피**: Airbnb Cereal VF는 라이선스 폰트라 사용할 수 없어, 스펙이 직접 명시한 오픈소스 대체 폰트 **Inter**를 사용(`app/layout.tsx`). 크기/줄간격 토큰은 `text-display-md`, `text-title-md`, `text-body-sm` 등으로 정의.
- **라운드 코너**: 버튼 8px(`rounded-sm`), 카드 14px(`rounded-md`), 배지/버튼 pill은 `rounded-full`.
- **그림자**: 단일 그림자 톤(`shadow-card`)만 존재 — 카드 hover, 모달에 사용.
- **재사용 컴포넌트 클래스**: `.btn-primary`, `.btn-secondary`, `.btn-text`, `.input-field`, `.textarea-field`, `.card-surface`(`app/globals.css` `@layer components`).
- **우선순위 배지 색상 매핑**(Airbnb 스펙에 없는, 이 앱 고유 개념): High = primary(Rausch) 톤, Medium = ink 톤, Low = muted 톤 — "브랜드 컬러는 가장 중요한 한 가지에만 쓴다"는 원본 철학을 우선순위 개념에 대응시킴.

## 원본 스펙 (참고용 원문)

<details>
<summary>펼치기</summary>

- primary: #ff385c / primary-active: #e00b41 / primary-disabled: #ffd1da
- ink: #222222 / body: #3f3f3f / muted: #6a6a6a / muted-soft: #929292
- hairline: #dddddd / hairline-soft: #ebebeb / border-strong: #c1c1c1
- canvas: #ffffff / surface-soft: #f7f7f7 / surface-strong: #f2f2f2
- error: #c13515 / error-hover: #b32505
- 라운드: none 0 · xs 4px · sm 8px · md 14px · lg 20px · xl 32px · full 9999px
- 그림자(단일 톤): `0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.1)`
- 타이포(요약): display-lg 22/500, display-md 21/700, display-sm 20/600, title-md·sm 16, body-md 16/body-sm 14, caption 14/500, badge 11/600
- 버튼: primary(Rausch 배경, 흰 글자, 8px 라운드, 48px 높이), secondary(흰 배경 + ink 아웃라인)
- 폰트 대체: Airbnb Cereal VF/Circular 사용 불가 시 **Inter** 권장 (스펙 원문 명시)

</details>

# GitHub OAuth 설정 가이드

## 1. GitHub OAuth App 생성

1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. 값 입력:
   - **Application name**: 원하는 이름 (예: `할 일 관리 앱 (local)`)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
     (배포 환경이 따로 있다면 그 환경의 도메인으로 별도 OAuth App을 하나 더 만드는 것을 권장합니다.)
3. **Register application** 후 **Client ID**를 복사하고, **Generate a new client secret**으로 시크릿을 발급받습니다.

## 2. 환경변수 설정

`.env.local.example`을 `.env.local`로 복사한 뒤 값을 채웁니다.

```
GITHUB_CLIENT_ID=<위에서 복사한 Client ID>
GITHUB_CLIENT_SECRET=<위에서 발급받은 Client Secret>
```

`GITHUB_CLIENT_SECRET`은 절대 코드에 하드코딩하거나 커밋하지 마세요. `.env.local`은 `.gitignore`에 이미 포함되어 있습니다.

## 3. 로그인 흐름

- 로그인 없이는 모든 페이지(대시보드/할 일/주간 계획/1년 목표)가 `/auth/github`로 리다이렉트됩니다.
- `/auth/github` — GitHub 인가 화면으로 리다이렉트
- `/auth/github/callback` — GitHub이 리다이렉트해 오는 콜백. 로그인 성공 시 `/todos`로 이동
- 로그아웃은 사이드바의 "로그아웃" 버튼(내부적으로 `POST /auth/logout` 호출)
- 할 일/1년 목표/주간 계획은 전부 계정별로 완전히 분리됩니다(다른 사용자의 데이터는 조회/수정/삭제 불가).

## 4. 기존 데이터 마이그레이션

로그인 기능을 붙이기 전에 만들어 둔 할 일(Todo)/1년 목표(Goal)/주간 계획(WeeklyPlan) 문서에는 소유자(`userId`)가 없습니다. GitHub로 한 번 로그인해 사용자 레코드를 만든 뒤, 아래 스크립트로 기존 데이터를 그 계정에 일괄 할당하세요. 이 스크립트는 WeeklyPlan의 인덱스도 함께 손봅니다(주 단위 중복 방지 규칙이 "전체에서 유일"에서 "사용자별로 유일"로 바뀌었기 때문입니다).

```
node --env-file=.env.local scripts/backfill-user-id.mjs <github-username>
```

이미 `userId`가 있는 문서와 이미 올바른 인덱스는 건드리지 않으므로 여러 번 실행해도 안전합니다.

## 5. Vercel 등에 배포하기

`lib/mongodb.ts`는 `MONGODB_URI`가 없으면 모듈 로드 시점에 바로 에러를 던진다. 이 모듈은 루트 레이아웃을 거쳐 모든 페이지에서 로드되므로, 환경변수를 하나라도 빼먹으면 `/_not-found` 같은 무관한 페이지까지 포함해 **빌드 자체가 전부 실패**한다.

1. **환경변수** — 배포 플랫폼(Vercel 등)의 프로젝트 설정에 아래 3개를 추가한다:
   - `MONGODB_URI`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
2. **MongoDB Atlas Network Access** — Vercel의 서버리스 함수는 고정 IP가 아니므로, Atlas의 IP 접근 목록(Network Access)에 `0.0.0.0/0`(모든 IP 허용)이 등록되어 있어야 한다. 로컬 IP만 허용해뒀다면 빌드는 통과해도 런타임에서 DB 연결이 막힌다.
3. **배포용 GitHub OAuth App** — GitHub OAuth App은 Authorization callback URL을 하나만 등록할 수 있다. 로컬(`http://localhost:3000/...`)과 배포 도메인을 동시에 쓸 수 없으므로, 배포 도메인용 OAuth App을 별도로 만들고 그 client_id/secret을 배포 환경변수로 설정하는 것을 권장한다(로컬 개발 흐름이 깨지지 않는다).

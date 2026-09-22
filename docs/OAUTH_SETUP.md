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

- `/auth/github` — GitHub 인가 화면으로 리다이렉트
- `/auth/github/callback` — GitHub이 리다이렉트해 오는 콜백. 로그인 성공 시 `/todos`로 이동
- 로그아웃은 사이드바의 "로그아웃" 버튼(내부적으로 `POST /auth/logout` 호출)

## 4. 기존 할 일 데이터 마이그레이션

로그인 기능을 붙이기 전에 만들어 둔 할 일(Todo) 문서에는 소유자(`userId`)가 없습니다. GitHub로 한 번 로그인해 사용자 레코드를 만든 뒤, 아래 스크립트로 기존 데이터를 그 계정에 할당하세요.

```
node --env-file=.env.local scripts/backfill-todo-user.mjs <github-username>
```

이미 `userId`가 있는 문서는 건드리지 않으므로 여러 번 실행해도 안전합니다.

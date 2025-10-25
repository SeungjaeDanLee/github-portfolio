# 🚀 GitHub Portfolio Generator

GitHub 계정의 public repository와 README 파일을 분석하여 AI가 자동으로 포트폴리오를 생성하는 Next.js 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 GitHub OAuth 로그인

- GitHub 계정으로 안전한 로그인
- NextAuth v5를 통한 세션 관리
- 사용자 프로필 정보 표시

### 📊 포트폴리오 데이터 수집

- **사용자 정보**: 이름, 바이오, 팔로워/팔로잉 수, 아바타
- **Repository 정보**: 이름, 설명, 언어, 스타/포크 수, 생성/수정 날짜
- **README 파일**: 각 프로젝트의 상세 설명 자동 수집
- **Topics**: 프로젝트 태그 정보

### 🤖 AI 포트폴리오 생성

- **Gemini AI**: Google Gemini 2.0 Flash를 활용한 포트폴리오 자동 생성
- **GPT-4o**: OpenAI GPT-4o 지원 (준비 중)
- 수집된 데이터를 AI에게 전달하여 맞춤형 포트폴리오 생성
- 마크다운 형식으로 전문적인 포트폴리오 렌더링
- 배지 이미지 및 링크 자동 포함

### 📄 PDF 다운로드

- 생성된 포트폴리오를 PDF로 내보내기
- 다중 페이지 지원
- 고품질 이미지 렌더링

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, @tailwindcss/typography
- **Authentication**: NextAuth v5 (beta)
- **API**: GitHub REST API, Google Gemini API
- **Markdown**: react-markdown, remark-gfm, rehype-sanitize, rehype-raw
- **PDF**: jsPDF, html2canvas
- **Deployment**: Vercel (예정)

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/SeungjaeDanLee/github-portfolio.git
cd github-portfolio
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# GitHub OAuth 설정
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth 설정
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your_nextauth_secret_key_here

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: NextAuth v5는 `AUTH_SECRET` 환경 변수를 사용합니다.

### 4. GitHub OAuth App 생성

1. GitHub → Settings → Developer settings → OAuth Apps
2. "New OAuth App" 클릭
3. 다음 정보 입력:
   - **Application name**: GitHub Portfolio
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 생성된 Client ID와 Client Secret을 `.env.local`에 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하세요.

## 🖥️ Windows 사용자를 위한 추가 설정

### Git 설정 (Windows)

```bash
# 라인 엔딩 문제 해결
git config core.autocrlf false
git config core.eol lf

# 기존 파일들의 라인 엔딩 정규화
git add --renormalize .
git commit -m "Normalize line endings"
```

### 의존성 재설치 (Windows)

```bash
# 기존 node_modules 삭제
rmdir /s node_modules
del package-lock.json

# 의존성 재설치
npm install --legacy-peer-deps
```

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth 설정
│   │   └── github/                  # GitHub API 라우트
│   │       ├── user/route.ts        # 사용자 정보 API
│   │       └── readme/route.ts      # README 파일 API
│   ├── layout.tsx                  # 루트 레이아웃
│   └── page.tsx                     # 메인 페이지
├── lib/
│   └── auth.ts                      # NextAuth 설정
├── types/
│   └── next-auth.d.ts               # NextAuth 타입 확장
└── lib/errors/
    └── app-errors.ts                # 에러 처리
```

## 🔧 API 엔드포인트

### `/api/github/user`

- **Method**: GET
- **Description**: GitHub 사용자 정보 및 public repository 목록
- **Response**: 사용자 정보와 repository 배열

### `/api/github/readme`

- **Method**: POST
- **Description**: 특정 repository의 README 파일 내용
- **Body**: `{ "owner": "username", "repo": "repository-name" }`
- **Response**: README 파일 내용과 메타데이터

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일/데스크톱 완벽 지원
- **다크 모드**: 시스템 설정에 따른 자동 테마 전환
- **로딩 상태**: 포트폴리오 생성 중 스피너 애니메이션
- **에러 처리**: 안전한 API 호출 및 사용자 친화적 에러 메시지
- **텍스트 오버플로우 방지**: 자동 줄바꿈으로 모든 텍스트 화면 내 표시
- **마크다운 렌더링**: 배지 이미지, 링크, 코드 블록 등 완벽 지원
- **Prose 스타일링**: @tailwindcss/typography를 활용한 전문적인 타이포그래피

## 🔒 보안

- **GitHub OAuth**: 안전한 인증 시스템
- **환경변수**: 민감한 정보 보호
- **타입 안정성**: TypeScript로 타입 안전성 확보
- **API 토큰**: GitHub API 호출 시 Bearer 토큰 사용

## 🚧 개발 로드맵

### ✅ 완료된 기능

- [x] GitHub OAuth 로그인
- [x] 사용자 정보 수집
- [x] Repository 목록 수집
- [x] README 파일 수집
- [x] 데이터 구조화
- [x] TypeScript 타입 안정성
- [x] Gemini AI 연동
- [x] 포트폴리오 자동 생성
- [x] 마크다운 렌더링 (배지, 이미지, 링크)
- [x] PDF 내보내기
- [x] 텍스트 오버플로우 방지
- [x] 다크 모드 지원

### 🔄 진행 중

- [ ] GPT-4o 연동
- [ ] 포트폴리오 커스터마이징

### 📋 예정된 기능

- [ ] 포트폴리오 템플릿 선택
- [ ] 포트폴리오 공유 기능
- [ ] 포트폴리오 통계 대시보드
- [ ] 다국어 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ by Seungjae Lee**

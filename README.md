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

### 🤖 AI 포트폴리오 생성 (준비 중)

- 수집된 데이터를 AI에게 전달
- 자동으로 포트폴리오 생성
- 사용자 맞춤형 포트폴리오 제공

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth v5 (beta)
- **API**: GitHub REST API
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
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

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

### 🔄 진행 중

- [ ] AI 연동 (OpenAI/Claude/Gemini)
- [ ] 포트폴리오 자동 생성
- [ ] 포트폴리오 커스터마이징

### 📋 예정된 기능

- [ ] 포트폴리오 템플릿 선택
- [ ] 포트폴리오 공유 기능
- [ ] 포트폴리오 PDF 내보내기
- [ ] 포트폴리오 통계 대시보드

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

**Made with ❤️ by [Your Name]**

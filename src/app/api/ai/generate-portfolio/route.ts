import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { portfolioData } = await request.json();

    console.log("Received portfolio data:", JSON.stringify(portfolioData, null, 2));

    if (!portfolioData) {
      return NextResponse.json(
        { error: "Portfolio data is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 포트폴리오 데이터를 분석하여 프롬프트 생성
    const prompt = `
당신은 세계 최고 수준의 기술 포트폴리오 전문가입니다. GitHub 데이터를 심층 분석하여 전문적이고 매력적인 포트폴리오를 작성해주세요.

## 분석 대상 정보

### 개발자 프로필
- **이름**: ${portfolioData.user.name || portfolioData.user.login}
- **소개**: ${portfolioData.user.bio || "정보 없음"}
- **커뮤니티 영향력**: 팔로워 ${portfolioData.user.followers}명 | 팔로잉 ${portfolioData.user.following}명
- **공개 저장소**: ${portfolioData.user.public_repos}개

### 주요 프로젝트 목록
${portfolioData.repositories
  .slice(0, 10)
  .map(
    (repo: any, index: number) => `
**${index + 1}. ${repo.name}**
   - 설명: ${repo.description || "설명 없음"}
   - 주요 언어: ${repo.language || "언어 정보 없음"}
   - 관심도: ⭐ ${repo.stars} | 🍴 ${repo.forks}
   - 활동 기간: ${new Date(repo.created_at).toLocaleDateString('ko-KR')} ~ ${new Date(repo.updated_at).toLocaleDateString('ko-KR')}
   - 주제: ${repo.topics?.join(', ') || "없음"}
   ${repo.readme ? `- README 요약: ${repo.readme.substring(0, 300)}...` : ""}
`
  )
  .join("")}

## 작성 가이드라인

다음 구조로 **마크다운 형식**의 전문적인 포트폴리오를 작성해주세요:

# 💼 ${portfolioData.user.name || portfolioData.user.login}

> 한 줄로 개발자를 표현하는 임팩트 있는 소개 문구

---

## 👨‍💻 About Me

개발자의 전문성, 경험, 개발 철학을 3-4문장으로 서술해주세요.
- GitHub 활동과 프로젝트 특성을 분석하여 개발자의 강점 부각
- 구체적인 수치와 성과를 포함
- 전문적이면서도 친근한 톤 유지

## 🛠 Tech Stack

프로젝트에서 사용된 언어와 기술을 분석하여 다음 카테고리로 분류:

### Languages
가장 많이 사용된 언어 상위 5개 (배지 형식으로 표현)

### Frameworks & Libraries
프로젝트에서 발견된 주요 프레임워크와 라이브러리

### Tools & Platforms
개발 도구 및 플랫폼 (GitHub Topics 활용)

## 🚀 Featured Projects

**가장 주목할 만한 프로젝트 3-5개**를 선정하여 다음 형식으로 작성:

### 📌 [프로젝트명]
- **설명**: 프로젝트의 목적과 핵심 기능 (2-3문장)
- **기술 스택**: 사용된 주요 기술
- **성과**: 스타 수, 포크 수, 특별한 성과
- **하이라이트**: README에서 추출한 핵심 내용 또는 특징적인 구현 사항

## 📊 GitHub Analytics

- 📦 **총 저장소**: ${portfolioData.user.public_repos}개
- 👥 **커뮤니티**: 팔로워 ${portfolioData.user.followers}명 | 팔로잉 ${portfolioData.user.following}명
- ⭐ **총 스타 수**: (모든 프로젝트의 스타 합계)
- 🔥 **활동 기간**: 가장 오래된 프로젝트 ~ 최근 업데이트

## 🎯 Areas of Expertise

README와 프로젝트 분석을 통해 발견된 전문 분야를 3-5개 항목으로 정리:
- 각 분야별로 관련 프로젝트와 기술을 구체적으로 언급
- 왜 이 분야의 전문가로 볼 수 있는지 근거 제시

## 💡 Development Journey

프로젝트 생성 날짜와 기술 스택 변화를 분석하여 개발자의 성장 스토리를 작성:
- 시간 순서대로 기술 스택의 진화 과정 서술
- 주요 마일스톤 프로젝트 언급
- 현재 관심사와 학습 방향 추론

## 📫 Contact & Links

- **GitHub**: [@${portfolioData.user.login}](https://github.com/${portfolioData.user.login})
${portfolioData.user.email ? `- **Email**: ${portfolioData.user.email}` : ''}

---

**⚠️ 중요 작성 규칙:**
1. 모든 내용은 **마크다운 형식**으로 작성 (제목, 링크, 볼드, 리스트 등 적극 활용)
2. 실제 데이터를 기반으로 구체적이고 정확하게 작성
3. 일반적인 설명보다는 **이 개발자만의 특징**을 강조
4. 각 섹션은 간결하지만 임팩트 있게 작성
5. 기술 용어는 정확하게 사용
6. README 내용이 있는 경우 핵심 정보를 적극 활용
7. 프로페셔널하면서도 읽기 쉬운 톤 유지
`;

    console.log("Generated prompt for Gemini API:", prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedPortfolio = response.text();

    console.log("Received response from Gemini API:", generatedPortfolio);

    return NextResponse.json({
      success: true,
      portfolio: generatedPortfolio,
      user: portfolioData.user,
      projectCount: portfolioData.repositories.length,
    });
  } catch (error) {
    console.error("Gemini API error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to generate portfolio" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
  try {
    const { portfolioData } = await request.json();

    if (!portfolioData) {
      return NextResponse.json(
        { error: "Portfolio data is required" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // 포트폴리오 데이터를 분석하여 프롬프트 생성
    const prompt = `
당신은 전문적인 포트폴리오 작성자입니다. 다음 GitHub 사용자 데이터를 분석하여 개인화된 포트폴리오를 생성해주세요.

사용자 정보:
- 이름: ${portfolioData.user.name || portfolioData.user.login}
- 바이오: ${portfolioData.user.bio || "정보 없음"}
- 팔로워: ${portfolioData.user.followers}명
- 팔로잉: ${portfolioData.user.following}명
- Public Repository: ${portfolioData.user.public_repos}개

주요 프로젝트들:
${portfolioData.repositories
  .slice(0, 10)
  .map(
    (repo: any, index: number) => `
${index + 1}. ${repo.name}
   - 설명: ${repo.description || "설명 없음"}
   - 언어: ${repo.language || "언어 정보 없음"}
   - 스타: ${repo.stars}개
   - 포크: ${repo.forks}개
   - README: ${repo.hasReadme ? "있음" : "없음"}
   ${repo.readme ? `- README 내용: ${repo.readme.substring(0, 200)}...` : ""}
`
  )
  .join("")}

위 정보를 바탕으로 다음 형식으로 포트폴리오를 생성해주세요:

# ${portfolioData.user.name || portfolioData.user.login}의 포트폴리오

## 👋 소개
[사용자의 바이오와 GitHub 활동을 바탕으로 한 개인 소개]

## 🚀 주요 기술 스택
[사용된 프로그래밍 언어들을 분석하여 기술 스택 정리]

## 💼 주요 프로젝트
[가장 인상적인 프로젝트들을 선별하여 상세 설명]

## 📊 GitHub 통계
[팔로워, 팔로잉, Repository 수 등 통계 정보]

## 🎯 관심사 및 전문 분야
[README 파일과 프로젝트 분석을 바탕으로 한 전문 분야]

## 📈 성장 과정
[프로젝트 생성 날짜와 활동 패턴을 분석한 성장 과정]

## 🔗 연락처
- GitHub: https://github.com/${portfolioData.user.login}
- 이메일: ${portfolioData.user.email || "연락처 정보 없음"}

위 형식으로 한국어로 포트폴리오를 작성해주세요. 각 섹션은 구체적이고 개인화된 내용으로 작성해주세요.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "당신은 전문적인 포트폴리오 작성자입니다. GitHub 데이터를 분석하여 개인화된 포트폴리오를 생성합니다.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const generatedPortfolio = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      portfolio: generatedPortfolio,
      user: portfolioData.user,
      projectCount: portfolioData.repositories.length,
      aiModel: "GPT-4o",
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate portfolio with GPT" },
      { status: 500 }
    );
  }
}

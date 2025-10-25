"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useRef } from "react";
import Modal from "@/components/Modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const { data: session, status } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPortfolio, setGeneratedPortfolio] = useState<string | null>(
    null
  );
  const [selectedAI, setSelectedAI] = useState<"gemini" | "gpt">("gemini");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!portfolioRef.current) return;

    try {
      const canvas = await html2canvas(portfolioRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(
        `${session?.user?.name || "portfolio"}_portfolio_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("PDF 다운로드에 실패했습니다.");
    }
  };

  const generatePortfolio = async () => {
    if (!session?.accessToken) return;

    if (selectedAI === "gpt") {
      setIsModalOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // 1. 사용자 정보 및 repository 목록 가져오기
      const userResponse = await fetch("/api/github/user");
      const { user, repositories } = await userResponse.json();

      // 2. 각 repository의 README 파일 가져오기
      const readmePromises = repositories.map(async (repo: any) => {
        try {
          const readmeResponse = await fetch("/api/github/readme", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner: repo.owner.login, repo: repo.name }),
          });
          const readmeData = await readmeResponse.json();
          return {
            ...repo,
            readme: readmeData.content,
            hasReadme: readmeData.hasReadme,
          };
        } catch (error) {
          return { ...repo, readme: null, hasReadme: false };
        }
      });

      const repositoriesWithReadme = await Promise.all(readmePromises);

      // 3. AI 분석을 위한 데이터 구조화
      const portfolioData = {
        user: {
          name: user.name,
          login: user.login,
          bio: user.bio,
          avatar_url: user.avatar_url,
          public_repos: user.public_repos,
          followers: user.followers,
          following: user.following,
        },
        repositories: repositoriesWithReadme.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          readme: repo.readme,
          hasReadme: repo.hasReadme,
          topics: repo.topics,
        })),
      };

      console.log("Portfolio data:", portfolioData);

      // 4. 선택된 AI를 사용하여 포트폴리오 생성
      const aiEndpoint =
        selectedAI === "gemini"
          ? "/api/ai/generate-portfolio"
          : "/api/ai/generate-portfolio-gpt";

      const aiResponse = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolioData }),
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        setGeneratedPortfolio(aiResult.portfolio);
        console.log("Generated portfolio:", aiResult.portfolio);
      } else {
        console.error("Failed to generate portfolio with AI");
      }
    } catch (error) {
      console.error("Error generating portfolio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 font-sans">
      <main className="flex min-h-screen w-full flex-col items-center justify-start py-12 px-4 md:px-8">
        <div className="flex flex-col items-center gap-8 text-center w-full max-w-6xl">
          <div className="flex flex-col items-center gap-4 mt-8">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              GitHub Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              AI가 분석하는 나만의 개발자 포트폴리오
            </p>
          </div>

          {session ? (
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex items-center gap-6 border border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Image
                    src={session.user?.image || "/next.svg"}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full ring-4 ring-blue-100 dark:ring-blue-900"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800"></div>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    안녕하세요, {session.user?.name}님!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {session.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    AI 모델 선택
                  </label>
                  <div className="flex gap-4 justify-center">
                    <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-300 dark:border-blue-700 has-[:checked]:border-blue-600 dark:has-[:checked]:border-blue-400 has-[:checked]:shadow-lg">
                      <input
                        type="radio"
                        name="ai-model"
                        value="gemini"
                        checked={selectedAI === "gemini"}
                        onChange={(e) =>
                          setSelectedAI(e.target.value as "gemini" | "gpt")
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        🤖 Gemini AI
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer px-6 py-3 rounded-xl border-2 transition-all hover:scale-105 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-300 dark:border-purple-700 has-[:checked]:border-purple-600 dark:has-[:checked]:border-purple-400 has-[:checked]:shadow-lg">
                      <input
                        type="radio"
                        name="ai-model"
                        value="gpt"
                        checked={selectedAI === "gpt"}
                        onChange={(e) =>
                          setSelectedAI(e.target.value as "gemini" | "gpt")
                        }
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        🧠 GPT-4o
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full sm:flex-row">
                  <button
                    onClick={generatePortfolio}
                    disabled={isGenerating}
                    className="flex-1 flex h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-white font-semibold text-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="h-6 w-6 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        생성 중...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        포트폴리오 생성
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => signOut()}
                    className="flex h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-8 text-white font-semibold text-lg transition-all hover:from-red-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 sm:w-auto"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    로그아웃
                  </button>
                </div>
              </div>

              {generatedPortfolio && (
                <div className="mt-8 w-full max-w-5xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-black dark:text-zinc-50">
                      {selectedAI === "gemini" ? "🤖 Gemini AI" : "🧠 GPT-4o"}{" "}
                      생성 포트폴리오
                    </h3>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      PDF 다운로드
                    </button>
                  </div>
                  <div
                    ref={portfolioRef}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 md:p-12 shadow-2xl"
                  >
                    <article className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-8 prose-h3:text-2xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-ul:list-disc prose-ol:list-decimal">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      >
                        {generatedPortfolio}
                      </ReactMarkdown>
                    </article>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8 max-w-lg">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full mb-4">
                    <svg
                      className="h-10 w-10 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  시작해볼까요?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  GitHub 계정으로 로그인하여
                  <br />
                  AI가 생성하는 전문 포트폴리오를 확인해보세요
                </p>

                <button
                  onClick={() => signIn("github")}
                  className="w-full flex h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 px-8 text-white font-semibold text-lg transition-all hover:from-gray-800 hover:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-2xl hover:scale-105"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub로 로그인
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-2">🤖</div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    AI 분석
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    자동 생성
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl mb-2">📥</div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PDF 다운
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              서비스 준비중입니다.
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              현재 GPT-4o 기능은 준비중입니다. 빠른 시일 내에 찾아뵙겠습니다.
            </p>
          </div>
        </Modal>
      </main>
    </div>
  );
}

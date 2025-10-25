"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolio, setPortfolio] = useState(null);

  const generatePortfolio = async () => {
    if (!session?.accessToken) return;

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
      setPortfolio(portfolioData);
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            GitHub Portfolio
          </h1>

          {session ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4">
                <Image
                  src={session.user?.image || "/next.svg"}
                  alt="Profile"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
                    안녕하세요, {session.user?.name}님!
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full md:flex-row">
                <button
                  onClick={generatePortfolio}
                  disabled={isGenerating}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400 md:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
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
                        className="h-5 w-5"
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
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-white transition-colors hover:bg-red-700 md:w-auto"
                >
                  로그아웃
                </button>
              </div>

              {portfolio && (
                <div className="mt-8 w-full max-w-4xl">
                  <h3 className="text-2xl font-bold text-black dark:text-zinc-50 mb-6">
                    포트폴리오 데이터
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                    <pre className="text-sm overflow-auto max-h-96">
                      {JSON.stringify(portfolio, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                GitHub 계정으로 로그인하여 포트폴리오를 확인해보세요
              </p>

              <button
                onClick={() => signIn("github")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-6 text-white transition-colors hover:bg-gray-800 md:w-auto"
              >
                <svg
                  className="h-5 w-5"
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
          )}
        </div>
      </main>
    </div>
  );
}

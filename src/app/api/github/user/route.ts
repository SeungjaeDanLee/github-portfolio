import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // GitHub API를 통해 사용자 정보 가져오기
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "User-Agent": "GitHub-Portfolio-App",
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData = await userResponse.json();

    // Public repositories 가져오기
    const reposResponse = await fetch(
      `https://api.github.com/users/${userData.login}/repos?type=public&sort=updated&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "User-Agent": "GitHub-Portfolio-App",
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repositories = await reposResponse.json();

    return NextResponse.json({
      user: userData,
      repositories: repositories,
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    );
  }
}

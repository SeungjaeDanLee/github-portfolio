import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    // GitHub API를 통해 README 파일 가져오기
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "User-Agent": "GitHub-Portfolio-App",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!readmeResponse.ok) {
      if (readmeResponse.status === 404) {
        return NextResponse.json({ content: null, hasReadme: false });
      }
      throw new Error("Failed to fetch README");
    }

    const readmeData = await readmeResponse.json();

    // Base64 디코딩
    const content = Buffer.from(readmeData.content, "base64").toString("utf-8");

    return NextResponse.json({
      content,
      hasReadme: true,
      downloadUrl: readmeData.download_url,
    });
  } catch (error) {
    console.error("GitHub README API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch README" },
      { status: 500 }
    );
  }
}

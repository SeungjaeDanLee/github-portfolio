// src/types/github.ts
import { z } from 'zod';

/**
 * @fileoverview GitHub API 응답 및 사용자 입력을 위한 Zod 스키마 및 TypeScript 타입 정의.
 */

// GitHub API 응답에서 필요한 레포지토리 데이터 스키마
export const repoSchema = z.object({
    id: z.number(),
    name: z.string().min(1, 'Repository name cannot be empty.'),
    description: z.string().nullable().default(null),
    language: z.string().nullable().default(null),
    html_url: z.string().url('Invalid GitHub repository URL.'),
    // contents_url을 사용하여 README.md 파일을 가져올 예정
    contents_url: z.string().url('Invalid GitHub contents URL.'),
    created_at: z.string(),
    updated_at: z.string(),
});

// README.md 파일을 포함하여 확장된 레포지토리 데이터 스키마
export const portfolioRepoSchema = repoSchema.extend({
    readme_content_html: z.string().default('README.md 내용이 없습니다.'),
});

// 사용자 입력을 위한 Zod 스키마 (GitHub ID 및 생년월일)
export const userInputSchema = z.object({
    githubId: z.string().min(1, 'GitHub ID는 필수입니다.'),
    // 생년월일은 선택 사항이며, YYYY-MM-DD 형식을 따르도록 Regex 검증
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식(YYYY-MM-DD)이 올바르지 않습니다.').optional().or(z.literal('')),
});


// Zod 스키마로부터 TypeScript 타입을 추론
export type RepoData = z.infer<typeof repoSchema>;
export type PortfolioRepoData = z.infer<typeof portfolioRepoSchema>;
export type UserInput = z.infer<typeof userInputSchema>;
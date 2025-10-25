// src/lib/errors/app-errors.ts

/**
 * @fileoverview 프로젝트 전체에서 사용되는 커스텀 에러 정의.
 * 일관된 에러 핸들링과 로깅을 위해 사용됩니다.
 */

export class AppError extends Error {
    /**
     * 커스텀 애플리케이션 에러
     * @param message 사용자에게 보여줄 에러 메시지
     * @param statusCode HTTP 상태 코드 (기본값: 500)
     */
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.name = 'AppError';
        // 에러 스택 트레이스 생성
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

export class GitHubApiError extends AppError {
    /**
     * GitHub API 호출 관련 에러 (예: Rate Limit 초과, 사용자 없음)
     * @param message 상세 에러 메시지
     * @param statusCode HTTP 상태 코드 (API 응답 기반, 기본값: 500)
     */
    constructor(message: string, statusCode: number = 500) {
        super(message, statusCode);
        this.name = 'GitHubApiError';
    }
}

export class ValidationError extends AppError {
    /**
     * 사용자 입력 또는 Zod 스키마 유효성 검사 실패 에러
     * @param message 상세 에러 메시지
     */
    constructor(message: string) {
        super(message, 400); // 400 Bad Request
        this.name = 'ValidationError';
    }
}
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type RequestOptions = RequestInit & {
    token?: string;
};

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...fetchOptions,
            headers,
        });
    } catch {
        throw new Error(
            `Unable to reach the API at ${API_URL}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.`,
        );
    }

    if (!response.ok) {
        let detail = "API request failed";

        try {
            const body = await response.json();
            detail = body.detail ?? detail;
        } catch {
            // Ignore invalid JSON response
        }

        throw new ApiError(`${detail} (HTTP ${response.status})`, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}

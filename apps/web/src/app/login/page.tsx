"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login, setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await login({
        username,
        password,
      });

    setToken(result.access_token);

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">
            IRIS
          </h1>

          <p className="text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Username
          </label>

          <input
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            className="mt-1 w-full rounded border p-2"
            placeholder="Username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="mt-1 w-full rounded border p-2"
            placeholder="Password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
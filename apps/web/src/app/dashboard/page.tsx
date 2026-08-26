"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CurrentUser,
  getCurrentUser,
  getToken,
  removeToken,
} from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        removeToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              IRIS
            </h1>

            <p className="text-gray-500">
              Personal Operating System
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded border px-4 py-2"
          >
            Logout
          </button>
        </header>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Welcome, {user.username}
          </h2>

          <p className="mt-2 text-gray-500">
            {user.email}
          </p>

          <Link
            href="/projects"
            className="mt-6 inline-flex rounded border px-4 py-2"
          >
            Projects
          </Link>
        </section>
      </div>
    </main>
  );
}

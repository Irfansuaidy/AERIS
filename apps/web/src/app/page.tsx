"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (token) {
            router.replace("/dashboard");
        } else {
            router.replace("/login");
        }
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0d0e] text-zinc-400">
            <p className="text-sm animate-pulse">Loading IRIS...</p>
        </div>
    );
}

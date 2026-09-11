"use client";

import CommandLine from "@/components/layout/CommandLine";
import { CurrentUser, getCurrentUser, getToken, removeToken } from "@/lib/auth";
import {
    Bell,
    BookOpen,
    CalendarDays,
    ChevronRight,
    FileText,
    FolderKanban,
    LogOut,
    Menu,
    Search,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [commandLineOpen, setCommandLineOpen] = useState(false);

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

    useEffect(() => {
        function handleShortcut(event: KeyboardEvent) {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setCommandLineOpen(open => !open);
            }
        }

        window.addEventListener("keydown", handleShortcut);
        return () => window.removeEventListener("keydown", handleShortcut);
    }, []);

    function handleLogout() {
        removeToken();
        router.replace("/login");
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
                <p className="text-gray-500">Loading IRIS...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const navItems = [
        { name: "Projects", href: "/projects", icon: FolderKanban },
        { name: "Notes", href: "/note", icon: FileText },
        { name: "IELTS Vocabulary", href: "/vocabulary", icon: BookOpen },
        { name: "Events", href: "/calendar", icon: CalendarDays },
        { name: "Documents", href: "/documents", icon: FileText },
    ];

    const pageName =
        pathname === "/dashboard"
            ? "Dashboard"
            : (navItems.find(item => pathname.startsWith(item.href))?.name ?? "Workspace");

    return (
        <div className="min-h-screen bg-[#0b0d0e] text-zinc-100">
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/8 bg-[#111516] transition-transform duration-200 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex h-20 items-center justify-between border-b border-white/8 px-6">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileNavOpen(false)}>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c7f36b] text-sm font-black text-[#142006]">
                            I
                        </span>
                        <span>
                            <span className="block text-lg font-semibold tracking-[0.2em] text-white">IRIS</span>
                            <span className="block text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                Personal OS
                            </span>
                        </span>
                    </Link>
                    <button
                        className="rounded-lg p-2 text-zinc-400 hover:bg-white/6 hover:text-white lg:hidden"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close navigation"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 px-4 py-6">
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                        Workspace
                    </p>
                    {navItems.map(item => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileNavOpen(false)}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${isActive ? "bg-[#c7f36b] text-[#142006]" : "text-zinc-400 hover:bg-white/6 hover:text-white"}`}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                                <span>{item.name}</span>
                                {isActive && <ChevronRight size={16} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-white/8 p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-white/4 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#32411c] text-sm font-semibold text-[#c7f36b]">
                            {user.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{user.username}</p>
                            <p className="truncate text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-lg p-2 text-zinc-500 hover:bg-white/6 hover:text-red-300"
                            aria-label="Log out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
            {mobileNavOpen && (
                <button
                    className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation overlay"
                />
            )}

            <main className="min-w-0 lg:pl-72">
                <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/8 bg-[#0b0d0e]/90 px-4 backdrop-blur-xl sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-lg p-2 text-zinc-400 hover:bg-white/6 lg:hidden"
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-xs text-zinc-500">Workspace /</p>
                            <h2 className="text-sm font-semibold text-white">{pageName}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setCommandLineOpen(true)}
                            className="hidden items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-sm text-zinc-500 hover:border-white/16 hover:text-zinc-300 sm:flex"
                            aria-label="Open command line"
                        >
                            <Search size={16} />
                            <span>Command line</span>
                            <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-600">
                                Ctrl Shift K
                            </kbd>
                        </button>
                        <button
                            className="relative rounded-xl p-2.5 text-zinc-400 hover:bg-white/6 hover:text-white"
                            aria-label="Notifications"
                        >
                            <Bell size={18} />
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c7f36b]" />
                        </button>
                        <div className="hidden h-7 w-px bg-white/8 sm:block" />
                        <span className="hidden text-sm font-medium text-zinc-300 sm:block">{user.username}</span>
                    </div>
                </header>

                <div className="p-4 sm:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </div>
            </main>
            {commandLineOpen && <CommandLine onClose={() => setCommandLineOpen(false)} />}
        </div>
    );
}

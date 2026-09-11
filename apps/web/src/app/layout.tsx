"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Network,
  Search,
  Sparkles,
  Tags,
  X,
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "./globals.css";

const features = [
    {
        icon: LayoutDashboard,
        title: "One Command Center",
        description: "See tasks, projects, events, notes, and important information from one place.",
    },
    {
        icon: FolderKanban,
        title: "Projects & Tasks",
        description: "Turn ideas into structured projects, tasks, dependencies, and progress.",
    },
    {
        icon: FileText,
        title: "Knowledge",
        description: "Capture and organize notes, documents, and information without losing context.",
    },
    {
        icon: Tags,
        title: "Connected Context",
        description: "Use tags and relationships to connect information across your personal system.",
    },
    {
        icon: Search,
        title: "Find Anything",
        description: "Search across your personal data instead of remembering where everything lives.",
    },
    {
        icon: Sparkles,
        title: "AI Ready",
        description: "Built with an intelligence layer designed to make your data actionable.",
    },
];

const faqs = [
    {
        question: "What is IRIS?",
        answer: "IRIS is a Personal Operating System designed to unify tasks, projects, notes, events, documents, knowledge, and eventually AI into one system.",
    },
    {
        question: "Is IRIS a task manager?",
        answer: "Not exactly. Task management is only one part of IRIS. The goal is to connect tasks with projects, knowledge, events, documents, and other personal information.",
    },
    {
        question: "Can IRIS work locally?",
        answer: "Yes. IRIS is designed around a local-first architecture, allowing your personal data and services to remain under your control.",
    },
    {
        question: "Will IRIS have AI?",
        answer: "Yes. AERIS is planned as the intelligence layer of IRIS, responsible for understanding and working with the information stored in the system.",
    },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const pathname = usePathname();

    return (
        <html lang="en">
            <body className="min-h-screen bg-[#08090b] text-white">
                {pathname === "/" ? (
                    <main className="min-h-screen bg-[#08090b] text-white selection:bg-white selection:text-black">
                        {/* NAVBAR */}
                        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/6 bg-[#08090b]/80 backdrop-blur-xl">
                            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                                <a href="#" className="flex items-center gap-3 font-semibold tracking-tight">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/6">
                                        <Network className="h-4 w-4" />
                                    </div>

                                    <span className="text-lg">IRIS</span>
                                </a>

                                {/* Desktop navigation */}
                                <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
                                    <a href="#features" className="transition hover:text-white">
                                        Features
                                    </a>

                                    <a href="#philosophy" className="transition hover:text-white">
                                        Philosophy
                                    </a>

                                    <a href="#faq" className="transition hover:text-white">
                                        FAQ
                                    </a>
                                </div>

                                <div className="hidden items-center gap-3 md:flex">
                                    <a
                                        href="/login"
                                        className="rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/6 hover:text-white"
                                    >
                                        Sign in
                                    </a>

                                    <a
                                        href="/dashboard"
                                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                                    >
                                        Open IRIS
                                    </a>
                                </div>

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/6 hover:text-white md:hidden"
                                    aria-label="Toggle navigation"
                                >
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Mobile navigation */}
                            {mobileMenuOpen && (
                                <div className="border-t border-white/6 bg-[#08090b] px-6 py-5 md:hidden">
                                    <div className="flex flex-col gap-4 text-sm text-zinc-400">
                                        <a
                                            href="#features"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="hover:text-white"
                                        >
                                            Features
                                        </a>

                                        <a
                                            href="#philosophy"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="hover:text-white"
                                        >
                                            Philosophy
                                        </a>

                                        <a
                                            href="#faq"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="hover:text-white"
                                        >
                                            FAQ
                                        </a>

                                        <div className="my-2 h-px bg-white/6" />

                                        <a href="/login" className="hover:text-white">
                                            Sign in
                                        </a>

                                        <a
                                            href="/dashboard"
                                            className="rounded-lg bg-white px-4 py-2 text-center font-medium text-black"
                                        >
                                            Open IRIS
                                        </a>
                                    </div>
                                </div>
                            )}
                        </nav>

                        {/* HERO */}
                        <section className="relative overflow-hidden pt-32">
                            {/* Ambient background */}
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute left-1/2 top-20 h-125 w-175 -translate-x-1/2 rounded-full bg-white/[0.035] blur-[120px]" />

                                <div
                                    className="absolute inset-0 opacity-2.5"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                                        backgroundSize: "64px 64px",
                                    }}
                                />
                            </div>

                            <div className="relative mx-auto max-w-5xl px-6 pb-24 text-center lg:px-8 lg:pb-32">
                                {/* Badge */}
                                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs text-zinc-400">
                                    <Zap className="h-3.5 w-3.5" />
                                    <span>Your personal operating system</span>
                                </div>

                                {/* Heading */}
                                <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                    Your life.
                                    <br />
                                    <span className="text-zinc-500">One intelligent system.</span>
                                </h1>

                                <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                                    IRIS brings your tasks, projects, notes, events, documents, and knowledge into one
                                    connected personal workspace.
                                </p>

                                {/* CTA */}
                                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                                    <a
                                        href="/dashboard"
                                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                                    >
                                        Enter IRIS
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </a>

                                    <a
                                        href="#features"
                                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/3 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                                    >
                                        Explore the system
                                    </a>
                                </div>

                                {/* Dashboard preview */}
                                <div className="relative mx-auto mt-20 max-w-6xl">
                                    <div className="absolute -inset-8 rounded-4xl bg-white/2.5 blur-3xl" />

                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f12] text-left shadow-2xl">
                                        {/* Browser header */}
                                        <div className="flex h-11 items-center border-b border-white/6 px-4">
                                            <div className="flex gap-1.5">
                                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                                            </div>

                                            <div className="mx-auto hidden rounded-md border border-white/6 bg-white/2.5 px-20 py-1 text-[10px] text-zinc-600 sm:block">
                                                iris.local/dashboard
                                            </div>
                                        </div>

                                        {/* Dashboard */}
                                        <div className="flex min-h-110">
                                            {/* Sidebar */}
                                            <aside className="hidden w-48 shrink-0 border-r border-white/6 p-4 sm:block">
                                                <div className="mb-8 flex items-center gap-2 px-2">
                                                    <div className="h-5 w-5 rounded bg-white/10" />
                                                    <span className="text-xs font-semibold">IRIS</span>
                                                </div>

                                                <div className="space-y-1 text-[11px]">
                                                    {[
                                                        ["Dashboard", true],
                                                        ["Projects", false],
                                                        ["Tasks", false],
                                                        ["Notes", false],
                                                        ["Events", false],
                                                        ["Documents", false],
                                                        ["Tags", false],
                                                    ].map(([label, active]) => (
                                                        <div
                                                            key={label as string}
                                                            className={`rounded-md px-3 py-2 ${
                                                                active ? "bg-white/8 text-white" : "text-zinc-600"
                                                            }`}
                                                        >
                                                            {label as string}
                                                        </div>
                                                    ))}
                                                </div>
                                            </aside>

                                            {/* Dashboard content */}
                                            <div className="flex-1 p-5 sm:p-7">
                                                <div className="mb-6">
                                                    <div className="text-lg font-semibold">Good evening, Irfan</div>
                                                    <div className="mt-1 text-[11px] text-zinc-600">
                                                        Here&apos;s what needs your attention.
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                                                    {[
                                                        ["Tasks", "8"],
                                                        ["Overdue", "2"],
                                                        ["Projects", "3"],
                                                        ["Events", "4"],
                                                    ].map(([label, value]) => (
                                                        <div
                                                            key={label}
                                                            className="rounded-xl border border-white/6 bg-white/1.5 p-4"
                                                        >
                                                            <div className="text-[10px] text-zinc-600">{label}</div>
                                                            <div className="mt-2 text-xl font-semibold">{value}</div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Main grid */}
                                                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                                    {/* Tasks */}
                                                    <div className="rounded-xl border border-white/6 p-4">
                                                        <div className="mb-4 text-xs font-medium">
                                                            Today&apos;s Tasks
                                                        </div>

                                                        <div className="space-y-2">
                                                            {[
                                                                ["Task A", "High"],
                                                                ["Task B", "Medium"],
                                                                ["Task C", "Done"],
                                                            ].map(([task, priority], index) => (
                                                                <div
                                                                    key={task}
                                                                    className="flex items-center justify-between rounded-lg bg-white/2 px-3 py-2.5"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                                                                index === 2
                                                                                    ? "border-white/30 bg-white/20"
                                                                                    : "border-white/10"
                                                                            }`}
                                                                        >
                                                                            {index === 2 && (
                                                                                <Check className="h-2.5 w-2.5" />
                                                                            )}
                                                                        </div>

                                                                        <span
                                                                            className={`text-[11px] ${
                                                                                index === 2
                                                                                    ? "text-zinc-600 line-through"
                                                                                    : "text-zinc-300"
                                                                            }`}
                                                                        >
                                                                            {task}
                                                                        </span>
                                                                    </div>

                                                                    <span className="text-[9px] text-zinc-600">
                                                                        {priority}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Events */}
                                                    <div className="rounded-xl border border-white/6 p-4">
                                                        <div className="mb-4 text-xs font-medium">Upcoming Events</div>

                                                        <div className="space-y-2">
                                                            {["Event A", "Event B", "Event C"].map(event => (
                                                                <div
                                                                    key={event}
                                                                    className="flex items-center justify-between rounded-lg bg-white/2 px-3 py-2.5"
                                                                >
                                                                    <span className="text-[11px] text-zinc-300">
                                                                        {event}
                                                                    </span>

                                                                    <span className="text-[9px] text-zinc-600">
                                                                        Tomorrow
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Projects */}
                                                <div className="mt-4 rounded-xl border border-white/6 p-4">
                                                    <div className="mb-4 text-xs font-medium">Active Projects</div>

                                                    <div className="space-y-1">
                                                        {[
                                                            ["IRIS", "Active"],
                                                            ["EdgeVibe", "Planned"],
                                                            ["University Portfolio", "Active"],
                                                        ].map(([project, status]) => (
                                                            <div
                                                                key={project}
                                                                className="flex items-center justify-between rounded-lg px-3 py-2 text-[11px] hover:bg-white/2.5"
                                                            >
                                                                <span className="text-zinc-300">{project}</span>
                                                                <span className="text-zinc-600">{status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* PHILOSOPHY */}
                        <section id="philosophy" className="border-y border-white/6 bg-white/1.5">
                            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
                                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
                                            The problem
                                        </p>

                                        <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                            Your information shouldn&apos;t be scattered across a dozen apps.
                                        </h2>
                                    </div>

                                    <div className="space-y-5 text-sm leading-7 text-zinc-500">
                                        <p>
                                            Tasks live in one application. Notes live somewhere else. Documents are
                                            buried in folders. Events exist on a calendar. Context gets lost between
                                            them.
                                        </p>

                                        <p>
                                            IRIS takes a different approach: connect these pieces into a single system
                                            where information can retain its context.
                                        </p>

                                        <p className="text-zinc-300">
                                            The goal isn&apos;t to give you another app to maintain.
                                            <br />
                                            <span className="text-white">
                                                The goal is to reduce the number of systems you need to maintain.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* FEATURES */}
                        <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
                            <div className="max-w-2xl">
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">System</p>

                                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                    Everything connected.
                                </h2>

                                <p className="mt-4 text-sm leading-6 text-zinc-500">
                                    IRIS is designed as a system rather than a collection of isolated productivity
                                    features.
                                </p>
                            </div>

                            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/6 bg-white/6 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map(feature => {
                                    const Icon = feature.icon;

                                    return (
                                        <div
                                            key={feature.title}
                                            className="group bg-[#08090b] p-7 transition hover:bg-white/2.5"
                                        >
                                            <div className="mb-8 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/2.5">
                                                <Icon className="h-4 w-4 text-zinc-400 transition group-hover:text-white" />
                                            </div>

                                            <h3 className="text-sm font-medium">{feature.title}</h3>

                                            <p className="mt-3 text-xs leading-6 text-zinc-600">
                                                {feature.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* AERIS */}
                        <section className="border-y border-white/6 bg-white/1.5">
                            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
                                <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-[#0b0d10] p-8 sm:p-12 lg:p-16">
                                    <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-white/3 blur-3xl" />

                                    <div className="relative max-w-2xl">
                                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                                            <Sparkles className="h-5 w-5" />
                                        </div>

                                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">
                                            Intelligence Layer
                                        </p>

                                        <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                                            Meet AERIS.
                                        </h2>

                                        <p className="mt-5 text-sm leading-7 text-zinc-500">
                                            The intelligence layer designed to understand the information inside IRIS
                                            and eventually help you reason, discover patterns, and act on your personal
                                            data.
                                        </p>

                                        <div className="mt-8 inline-flex items-center gap-2 text-xs text-zinc-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                                            Adaptive Response Intelligence System
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* FAQ */}
                        <section id="faq" className="mx-auto max-w-3xl px-6 py-24 lg:py-32">
                            <div className="text-center">
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">FAQ</p>

                                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">Questions, answered.</h2>
                            </div>

                            <div className="mt-12 divide-y divide-white/6 border-y border-white/6">
                                {faqs.map((faq, index) => {
                                    const isOpen = openFaq === index;

                                    return (
                                        <div key={faq.question}>
                                            <button
                                                onClick={() => setOpenFaq(isOpen ? null : index)}
                                                className="flex w-full items-center justify-between py-5 text-left"
                                                aria-expanded={isOpen}
                                            >
                                                <span className="text-sm font-medium">{faq.question}</span>

                                                <ChevronDown
                                                    className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform ${
                                                        isOpen ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="pb-5 pr-8 text-sm leading-6 text-zinc-500">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* FINAL CTA */}
                        <section className="border-t border-white/6">
                            <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
                                <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                                    Build your system.
                                </h2>

                                <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-500">
                                    Stop managing disconnected tools. Start building a system around the way you
                                    actually think and work.
                                </p>

                                <a
                                    href="/dashboard"
                                    className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
                                >
                                    Enter IRIS
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                        </section>

                        {/* FOOTER */}
                        <footer className="border-t border-white/6">
                            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                                <div className="font-medium text-zinc-400">IRIS</div>

                                <div>Personal Operating System</div>

                                <div>© {new Date().getFullYear()} IRIS</div>
                            </div>
                        </footer>
                    </main>
                ) : (
                    children
                )}
            </body>
        </html>
    );
}

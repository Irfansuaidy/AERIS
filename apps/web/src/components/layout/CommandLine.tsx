"use client";

import { Terminal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

type CommandLineProps = {
    onClose: () => void;
};

type CommandResult = {
    command: string;
    output: string[];
};

const routes: Record<string, { label: string; path: string }> = {
    dashboard: { label: "Dashboard", path: "/dashboard" },
    project: { label: "Projects", path: "/projects" },
    projects: { label: "Projects", path: "/projects" },
    task: { label: "Tasks", path: "/tasks" },
    tasks: { label: "Tasks", path: "/tasks" },
    note: { label: "Notes", path: "/note" },
    notes: { label: "Notes", path: "/note" },
    vocab: { label: "IELTS Vocabulary", path: "/vocabulary" },
    vocabulary: { label: "IELTS Vocabulary", path: "/vocabulary" },
    event: { label: "Events", path: "/calendar" },
    events: { label: "Events", path: "/calendar" },
    calendar: { label: "Events", path: "/calendar" },
    document: { label: "Documents", path: "/documents" },
    documents: { label: "Documents", path: "/documents" },
};

const helpLines = [
    "to project       Open Projects",
    "to tasks         Open Tasks",
    "to notes         Open Notes",
    "to vocab         Open IELTS Vocabulary",
    "to events        Open Events / Calendar",
    "to documents     Open Documents",
    "to dashboard     Open Dashboard",
    "help             Show available commands",
    "clear            Clear terminal output",
    "exit             Close command line",
];

export default function CommandLine({ onClose }: CommandLineProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [command, setCommand] = useState("");
    const [history, setHistory] = useState<CommandResult[]>([
        {
            command: "system",
            output: [
                "AERIS command line ready.",
                "Type 'help' to list commands.",
            ],
        },
    ]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function runCommand(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const value = command.trim().toLowerCase();
        if (!value) return;

        if (value === "exit" || value === "quit") {
            onClose();
            return;
        }

        if (value === "clear") {
            setHistory([]);
            setCommand("");
            return;
        }

        if (value === "help") {
            setHistory((current) => [
                ...current,
                { command: value, output: helpLines },
            ]);
            setCommand("");
            return;
        }

        const match = value.match(/^to\s+(.+)$/);
        if (match) {
            const destination = routes[match[1]];
            if (destination) {
                setHistory((current) => [
                    ...current,
                    {
                        command: value,
                        output: [`Opening ${destination.label}...`],
                    },
                ]);
                setCommand("");
                window.setTimeout(() => {
                    onClose();
                    router.push(destination.path);
                }, 180);
                return;
            }
        }

        setHistory((current) => [
            ...current,
            {
                command: value,
                output: [
                    "Command not found.",
                    "Type 'help' to see available commands.",
                ],
            },
        ]);
        setCommand("");
    }

    return (
        <div className="fixed inset-0 z-70 flex items-start justify-center bg-black/75 p-4 pt-[12vh] backdrop-blur-sm sm:p-8 sm:pt-[16vh]">
            <section
                className="w-full max-w-3xl overflow-hidden border border-lime-300/25 bg-[#0b0f0d] shadow-2xl shadow-black/60"
                role="dialog"
                aria-modal="true"
                aria-label="AERIS command line">
                <div className="flex items-center justify-between border-b border-white/8 bg-[#151b17] px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Terminal size={15} className="text-lime-300" />
                        <span> AERIS / command line</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-1 text-zinc-500 hover:bg-white/6
        hover:text-white"
                        aria-label="Close command line">
                        <X size={16} />
                    </button>
                </div>
                <div className="max-h-[55vh] overflow-y-auto px-4 py-5 font-mono text-xs leading-6 sm:px-6">
                    {history.map((item, index) => (
                        <div key={`${item.command}-${index}`} className="mb-4">
                            <p className="text-lime-300">
                                <span className="text-zinc-600">
                                    aeris@workspace:
                                </span>
                                ~$ {item.command}
                            </p>
                            {item.output.map((line) => (
                                <p
                                    key={line}
                                    className="whitespace-pre-wrap text-zinc-400">
                                    {line}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
                <form
                    onSubmit={runCommand}
                    className="flex items-center gap-2 border-t border-white/8 px-4 py-4 font-mono text-sm sm:px-6">
                    <span className="shrink-0 text-lime-300">$</span>
                    <input
                        ref={inputRef}
                        value={command}
                        onChange={(event) => setCommand(event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-700"
                        placeholder="type a command..."
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Command input"
                    />
                </form>
            </section>
        </div>
    );
}

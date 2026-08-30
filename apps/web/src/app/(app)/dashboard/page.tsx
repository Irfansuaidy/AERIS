"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProjects, Project } from "@/lib/projects";
import { getTasks, Task } from "@/lib/tasks";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, taskRes] = await Promise.all([
          getProjects().catch(() => []),
          getTasks().catch(() => [])
        ]);
        setProjects(projRes as Project[]);
        setTasks(taskRes as Task[]);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  const activeProjects = projects.filter(p => p.status !== "completed");
  const pendingTasks = tasks.filter(t => t.status !== "done");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{projects.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">{activeProjects.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</h3>
          <p className="text-3xl font-bold mt-2">{tasks.length}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</h3>
          <p className="text-3xl font-bold mt-2">{pendingTasks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Projects</h3>
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg divide-y dark:divide-zinc-800">
            {activeProjects.slice(0, 5).map(project => (
              <div key={project.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.status}</p>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                  Priority {project.priority}
                </span>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No active projects</div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Tasks</h3>
            <Link href="/tasks" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-lg divide-y dark:divide-zinc-800">
            {pendingTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.status}</p>
                </div>
                {task.due_at && (
                  <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded">
                    Due: {new Date(task.due_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No pending tasks</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

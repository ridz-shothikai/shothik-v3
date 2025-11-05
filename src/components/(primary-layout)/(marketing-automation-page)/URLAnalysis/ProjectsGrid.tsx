"use client";

import {
  Clock,
  Folder,
  Image,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Loader2,
  Palette,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Project {
  _id: string;
  url: string;
  analysis_id: string;
  product: {
    title: string;
    brand: string;
    category: string;
    description: string;
  };
  createdAt: string;
}

interface ProjectsGridProps {
  projects: Project[];
  loadingProjects: boolean;
  deletingProject: string | null;
  onDeleteProject: (projectId: string, e: React.MouseEvent) => void;
  onProjectClick: (project: Project) => void;
}

export default function ProjectsGrid({
  projects,
  loadingProjects,
  deletingProject,
  onDeleteProject,
  onProjectClick,
}: ProjectsGridProps) {
  const router = useRouter();

  return (
    <div className="mt-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 shadow-lg shadow-teal-500/30">
            <Folder className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Your Projects
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Manage and track your campaigns
            </p>
          </div>
        </div>
        <span className="rounded-full border border-slate-700/50 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-md">
          {projects.length} {projects.length !== 1 ? "projects" : "project"}
        </span>
      </div>

      {loadingProjects ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center backdrop-blur-sm">
          <Folder className="mx-auto mb-4 h-16 w-16 text-teal-400 opacity-50" />
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Projects Yet
          </h3>
          <p className="text-sm text-gray-400">
            Analyze a URL above to create your first project
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="group relative">
              {/* Glow effect */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative h-full rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-4px] hover:bg-slate-800/60">
                <button
                  onClick={(e) => onDeleteProject(project._id, e)}
                  disabled={deletingProject === project._id}
                  className="status-error absolute top-4 right-4 z-10 rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100 disabled:opacity-50"
                >
                  {deletingProject === project._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>

                <div className="mb-4">
                  <span className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400 capitalize">
                    {project.product.category}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-teal-400">
                  {project.product.title}
                </h3>

                <p className="mb-3 text-sm text-gray-400">
                  by {project.product.brand}
                </p>

                <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                  <Link2 className="h-3 w-3" />
                  <span className="truncate">{project.url}</span>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-700/50 pt-4 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    onClick={() => onProjectClick(project)}
                    className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400 transition-all hover:scale-105 hover:bg-teal-500/20"
                    title="Open in Canvas"
                  >
                    <Palette className="h-3.5 w-3.5" />
                    Canvas
                  </button>
                  <button
                    onClick={() =>
                      router.push(
                        `/marketing-automation/dashboard/${project._id}`,
                      )
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition-all hover:scale-105 hover:bg-purple-500/20"
                    title="View Dashboard"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      const state = {
                        projectId: project._id,
                      };
                      const encodedState = encodeURIComponent(
                        JSON.stringify(state),
                      );
                      router.push(
                        `/marketing-automation/insights/${project.analysis_id}?state=${encodedState}`,
                      );
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-all hover:scale-105 hover:bg-blue-500/20"
                    title="AI Insights"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Insights
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/marketing-automation/media/${project._id}`)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-medium text-pink-400 transition-all hover:scale-105 hover:bg-pink-500/20"
                    title="AI Media"
                  >
                    <Image className="h-3.5 w-3.5" />
                    Media
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

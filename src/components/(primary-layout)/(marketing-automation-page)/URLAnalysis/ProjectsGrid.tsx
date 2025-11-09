"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
            <Folder className="text-primary-foreground h-6 w-6" />
          </div>
          <div>
            <h2 className="text-foreground text-3xl font-bold tracking-tight">
              Your Projects
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Manage and track your campaigns
            </p>
          </div>
        </div>
        <span className="border-border bg-card/60 text-foreground rounded-full border px-5 py-2.5 text-sm font-medium backdrop-blur-md">
          {projects.length} {projects.length !== 1 ? "projects" : "project"}
        </span>
      </div>

      {loadingProjects ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Folder className="text-primary mx-auto mb-4 h-16 w-16 opacity-50" />
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            No Projects Yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Analyze a URL above to create your first project
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project._id} className="group relative">
              {/* Glow effect */}
              <div className="bg-primary/20 absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"></div>

              <Card className="hover:border-primary/50 relative h-full transition-all duration-300 hover:translate-y-[-4px]">
                <CardContent className="px-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <span className="border-primary/30 bg-primary/10 text-primary rounded-lg border px-2 py-1 text-xs font-medium capitalize">
                        {project.product.category}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => onDeleteProject(project._id, e)}
                      disabled={deletingProject === project._id}
                      variant="ghost"
                      size="icon-sm"
                    >
                      {deletingProject === project._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="text-destructive h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-bold transition-colors">
                    {project.product.title}
                  </h3>

                  <p className="text-muted-foreground mb-3 text-sm">
                    by {project.product.brand}
                  </p>

                  <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                    <Link2 className="h-3 w-3" />
                    <span className="truncate">{project.url}</span>
                  </div>

                  <div className="border-border text-muted-foreground flex items-center gap-2 border-t pt-4 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 transition-all group-hover:opacity-100">
                    <Button
                      onClick={() => onProjectClick(project)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      title="Open in Canvas"
                    >
                      <Palette className="h-3.5 w-3.5" />
                      Canvas
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/marketing-automation/dashboard/${project._id}`,
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      title="View Dashboard"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Button>
                    <Button
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
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      title="AI Insights"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      Insights
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/marketing-automation/media/${project._id}`,
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      title="AI Media"
                    >
                      <Image className="h-3.5 w-3.5" />
                      Media
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client"

import { useGetProjects } from "@/modules/project/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const MyProjects = () => {
  const { data: projects, isPending } = useGetProjects();

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isPending) {
    return (
      <div className="w-full mt-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Your Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Your <span className="text-[#ff4136]">Projects</span>
        </h2>
        <div className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed border-neutral-200 rounded-2xl max-w-6xl mx-auto">
          <FolderKanban className="w-12 h-12 text-neutral-300" />
          <p className="text-neutral-500 font-medium">No projects yet</p>
          <Link href="/project">
            <button className="bg-[#ff4136] hover:bg-[#e6362c] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
              Create Project
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-neutral-200 hover:border-[#ff4136]/30 cursor-pointer bg-white overflow-hidden h-full">
      <CardHeader className="pb-3 pt-4 px-4 sm:pt-6 sm:px-6">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 sm:p-3 bg-[#ff4136]/8 rounded-xl group-hover:bg-[#ff4136]/15 transition-colors">
            <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff4136]" />
          </div>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-[#ff4136] group-hover:translate-x-1 transition-all mt-1" />
        </div>
        <CardTitle className="text-base sm:text-lg text-neutral-800 group-hover:text-[#ff4136] transition-colors line-clamp-1 sm:line-clamp-2">
          {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex items-center text-sm text-neutral-400">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-[#ff4136]/60 shrink-0" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full my-10">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Your <span className="text-[#ff4136]">Projects</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4">
        {projects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id} className="block">
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyProjects;
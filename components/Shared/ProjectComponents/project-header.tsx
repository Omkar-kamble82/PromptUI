import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  EditIcon,
  SunMoonIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetProjectById } from "@/modules/project/hooks";

const ProjectHeader = ({ projectId } : { projectId: string }) => {
  const { data: project, isPending, isError } = useGetProjectById(projectId);

  return (
    <header className="p-2 flex justify-between items-center border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild >
          <Button
            variant={"ghost"}
            size={"sm"}
            className={
              "focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2"
            }
          >
            <Image
              src={"/icon.png"}
              alt="Vibe"
              width={28}
              height={28}
              className="shrink-0 invert dark:invert-0"
            />
            <span className="text-sm font-medium">
              {isPending ? "Loading..." : project?.name || "Untitled Project"}
            </span>
            <ChevronDownIcon className="size-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side={"bottom"} align={"start"}  className="bg-white ">
          <DropdownMenuItem asChild>
            <Link href={"/project"}>
              <ChevronLeftIcon className="size-4" />
              <span>Go to Homepage</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default ProjectHeader;

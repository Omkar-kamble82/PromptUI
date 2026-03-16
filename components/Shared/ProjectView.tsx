"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import MessagesContainer from "@/components/Shared/ProjectComponents/message-container";
import { useState } from "react";
import ProjectHeader from "@/components/Shared/ProjectComponents/project-header";
import FragmentWeb from "@/components/Shared/ProjectComponents/fragment-web";
import { Code, EyeIcon } from "lucide-react";
import { FileExplorer } from "@/components/Shared/ProjectComponents/file-explorer";
import type { ProjectFragment } from "@/modules/message/types";

interface ProjectViewProps {
  projectId: string;
}

const ProjectView = ({ projectId }: ProjectViewProps) => {
  const [activeFragment, setActiveFragment] = useState<ProjectFragment | null>(null);
  const [tabState, setTabState] = useState("preview");

  return (
    <div className="h-screen">
        {/* @ts-ignore */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ProjectHeader projectId={projectId} />
          <MessagesContainer
            projectId={projectId}
            activeFragment={activeFragment}
            setActiveFragment={(fragment: ProjectFragment | null) => setActiveFragment(fragment)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          <Tabs
            className="h-full flex flex-col"
            defaultValue="preview"
            value={tabState}
            onValueChange={setTabState}
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="h-8 p-0 border rounded-md">
                <TabsTrigger
                  value="preview"
                  className="rounded-md px-3 flex items-center gap-x-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="rounded-md px-3 flex items-center gap-x-2"
                >
                  <Code className="h-4 w-4" />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="preview"
              className="flex-1 h-[calc(100%-4rem)] overflow-hidden"
            >
              {activeFragment ? (
                <FragmentWeb data={activeFragment} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a fragment to preview
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="code"
              className="flex-1 h-[calc(100%-4rem)] overflow-hidden"
            >
              {activeFragment?.files ? (
                <FileExplorer files={activeFragment.files as Record<string, string>} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a fragment to view code
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
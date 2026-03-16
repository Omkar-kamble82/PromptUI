import React, { useState } from "react";
import { ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FragmentData {
  sandboxUrl: string;
}

interface FragmentWebProps {
  data: FragmentData;
}

const FragmentWeb = ({ data }: FragmentWebProps) => {
  const [fragmentKey, setFragmentKey] = useState(0);
  const [copied, setCopied] = useState(false);

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onRefresh}>
              <RefreshCcw />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white" side="bottom" align="start">
            Refresh
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              disabled={!data.sandboxUrl || copied}
              className="flex-1 justify-start text-start font-normal"
            >
              <span className="truncate">{data.sandboxUrl}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            {copied ? "Copied" : "Click to copy"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild className="bg-white">
            <Button
              size="sm"
              variant="outline"
              className="bg-white"
              onClick={() => {
                if (!data.sandboxUrl) return;
                window.open(data.sandboxUrl, "_blank");
              }}
            >
              <ExternalLink />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-white" side="bottom" align="start">
            Open in new tab
          </TooltipContent>
        </Tooltip>
      </div>

      <iframe
        key={fragmentKey}
        className="h-full w-full"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
};

export default FragmentWeb;
import { MessageRole, MessageType } from "@/generated/prisma/enums";
import type { ProjectFragment } from "@/modules/message/types";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

interface FragmentCardProps {
  fragment: ProjectFragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: ProjectFragment) => void;
}

interface AssistantMessageProps {
  content: string;
  fragment?: ProjectFragment | null;
  createdAt: Date | string;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: ProjectFragment) => void;
  type: MessageType | undefined;
}

interface MessageCardProps extends Omit<AssistantMessageProps, "type"> {
  role: MessageRole;
  type?: MessageType;
}

// --- Task Summary Parser ---

function parseTaskSummary(content: string): { title: string; bullets: string[] } | null {
  const match = content.match(/<task_summary>([\s\S]*?)<\/task_summary>/);
  if (!match) return null;

  const lines = match[1]
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const title = lines[0] ?? "Summary";
  const bullets = lines.slice(1).filter((l) => l.startsWith("-")).map((l) => l.replace(/^-\s*/, ""));

  return { title, bullets };
}

const TaskSummaryCard = ({ title, bullets }: { title: string; bullets: string[] }) => {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4 w-fit max-w-sm">
      <p className="text-sm font-medium text-foreground mb-3">{title}</p>
      <ul className="space-y-1.5">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.75 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
};

// --- Fragment Card ---

const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-2 hover:bg-secondary transition-colors",
        isActiveFragment && "bg-[#ff4136] text-white border-primary hover:bg-primary"
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon className="size-4 mt-0.5" />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">{fragment.title}</span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
};

// --- User Message ---

const UserMessage = ({ content }: { content: string }) => {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-2 shadow-none border-none max-w-[80%] wrap-break-word">
        {content}
      </Card>
    </div>
  );
};

// --- Assistant Message ---

const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => {
  const taskSummary = parseTaskSummary(content);

  return (
    <div
      className={cn(
        "flex flex-col group px-2 pb-4",
        type === MessageType.ERROR && "text-red-700 dark:text-red-500"
      )}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <span className="text-sm font-medium">
          <Image
            src={"/icon.png"}
            alt="Vibe"
            width={20}
            height={20}
            className="shrink-0 invert dark:invert-0"
          />
        </span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(new Date(createdAt), "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>
      <div className="pl-8.5 flex flex-col gap-y-4">
        {taskSummary ? (
          <TaskSummaryCard title={taskSummary.title} bullets={taskSummary.bullets} />
        ) : (
          <span>{content}</span>
        )}
        {fragment && type === MessageType.RESULT && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
};

// --- Message Card ---

const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === MessageRole.ASSISTANT) {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }

  return <UserMessage content={content} />;
};

export default MessageCard;
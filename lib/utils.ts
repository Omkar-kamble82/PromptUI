import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AgentResult, Network, Message  } from "@inngest/agent-kit"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function lastAssistantTextMessageContent(result: AgentResult): string | undefined {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message: Message ) => message.role === "assistant"
  )

  const message = result.output[lastAssistantTextMessageIndex]

  if (!message) return undefined

  if (message.type === "text") {
    return typeof message.content === "string"
      ? message.content
      : message.content.map((c: { text: string }) => c.text).join("")
  }

  return undefined
}

type TreeNode = { [key: string]: TreeNode | null };
export type TreeItem = string | [string, ...TreeItem[]];

export function convertFilesToTreeItems(files: Record<string, unknown>): TreeItem[] {
  const tree: TreeNode = {};
  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as TreeNode;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = null;
  }

  function convertNode(node: TreeNode): TreeItem[] {
    const children: TreeItem[] = [];

    for (const [key, value] of Object.entries(node)) {
      if (value === null) {
        children.push(key);
      } else {
        const subTree = convertNode(value);
        children.push([key, ...subTree]);
      }
    }

    return children;
  }

  return convertNode(tree);
}
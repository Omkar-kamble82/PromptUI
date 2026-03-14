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
import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "e2b";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "agent/hello" },
  async ({ event, step }) => {

    const sandboxId = await step.run("Create sandbox", async () => {
      const sandbox = await Sandbox.create("6ow1ut7hul9wbzjkl275")
      return sandbox.sandboxId
    })

    const helloAgent = createAgent({
      name: "hello-agent",
      description: "An agent that says hello to the world",
      system: "You are a friendly agent that says hello to the world.",
      model: gemini({ model: "gemini-2.5-flash" })
    })

    const { output } = await helloAgent.run("Say hello to the user!")
    const textMessage = output.find((msg: any) => msg.type === "text" || "content" in msg)
    const content = (textMessage as any)?.content
    const message = Array.isArray(content)
      ? content.map((block: any) => block.text).join("")
      : content

    const sandboxUrl = await step.run("Get sandbox URL", async () => {
      const sandbox = await Sandbox.connect(sandboxId)
      const host = await sandbox.getHost(3000)
      return `https://${host}`  
    })

    return { message, sandboxUrl }  
  },
);
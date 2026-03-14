import { PROMPT } from "@/prompt";
import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork, AgentResult, Network, createState } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import z from "zod";
import { lastAssistantTextMessageContent } from "@/lib/utils";

export const codeAgent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {

    const sandboxId = await step.run("Create sandbox", async () => {
      const sandbox = await Sandbox.create(process.env.E2B_SANDBOX_ID!)
      return sandbox.sandboxId
    })

    const state = createState<{
      summary: string,
      files: Record<string, string>
    }>({
      summary: "",
      files: {},
    })

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({ model: "gemini-2.5-flash" }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" }
              try {
                const sandbox = await Sandbox.connect(sandboxId)
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => { buffers.stdout += data },
                  onStderr: (data) => { buffers.stderr += data },
                })
                return result.stdout
              } catch (error) {
                return `Command failed: ${error} \n stdout: ${buffers.stdout}\n stderr: ${buffers.stderr}`
              }
            })
          },
        }),

        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(z.object({
              path: z.string(),
              content: z.string(),
            })),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = network?.state?.data.files || {}
                const sandbox = await Sandbox.connect(sandboxId)
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content)
                  updatedFiles[file.path] = file.content
                }
                return updatedFiles
              } catch (error) {
                return "Error" + error
              }
            })

            if (typeof newFiles === "object" && network) {
              network.state.data.files = newFiles
            }
          },
        }),

        createTool({
          name: "readFiles",
          description: "Read files in the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId)
                const contents = []
                for (const file of files) {
                  const content = await sandbox.files.read(file)
                  contents.push({ path: file, content })
                }
                return JSON.stringify(contents)
              } catch (error) {
                return "Error" + error
              }
            })
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }: { 
          result: AgentResult; 
          network?: Network<{ summary: string; files: Record<string, string> }>
        }) => { 
          const lastAssistantMessageText = lastAssistantTextMessageContent(result)
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantMessageText
            }
          }
          return result
        },
      },
    })

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 10,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary
        if (summary) return;
        return codeAgent
      },
    })

    const result = await network.run(event.data.value, { state })

    const sandboxUrl = await step.run("Get sandbox URL", async () => {
      const sandbox = await Sandbox.connect(sandboxId)
      await new Promise(resolve => setTimeout(resolve, 10000))
      const host = await sandbox.getHost(3000)
      return `https://${host}`
    })

    return {
      url: sandboxUrl,
      title: "untitled",
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  },
);
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT, SIMPLE_PROMPT } from "@/prompt";
import { inngest } from "./client";
import { gemini, createAgent, createTool, createNetwork, AgentResult, Network, createState, openai } from "@inngest/agent-kit";
import { Sandbox } from "e2b";
import z from "zod";
import { lastAssistantTextMessageContent } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { MessageRole, MessageType } from "@/generated/prisma/client";

export const codeAgent = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("Create sandbox", async () => {
      const sandbox = await Sandbox.create(process.env.E2B_SANDBOX_ID!, {
        timeoutMs: 60000 * 30
      })
      return sandbox.sandboxId
    })

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        return formattedMessages;
      }
    );

    const state = createState<{
      summary: string,
      files: Record<string, string>
      messages: Array<{ type: string; role: string; content: string }>
    }>({
      summary: "",
      files: {},
      messages: previousMessages,
    })

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: SIMPLE_PROMPT,
      model: openai({
        model: "stepfun/step-3.5-flash:free",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      }),
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
            const currentFiles = network?.state?.data.files || {}

            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const sandbox = await Sandbox.connect(sandboxId)
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content)
                  currentFiles[file.path] = file.content
                }
                return currentFiles
              } catch (error) {
                return "Error" + error
              }
            })

            // FIX: was returning void — now explicitly updates state and returns confirmation
            if (typeof newFiles === "object" && network) {
              network.state.data.files = newFiles as Record<string, string>
            }

            return JSON.stringify({
              success: true,
              filesWritten: files.map(f => f.path),
            })
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
      maxIter: 3,
      defaultState: state,
      router: async ({ network }) => {
        if (network.state.data.summary) return
        return codeAgent
      },
    })

    const result = await network.run(event.data.value, { state })

    // FIX: Re-write all files from state into the sandbox before building.
    // The agent may have written files during its run, but sandbox sessions
    // are stateless reconnects. This guarantees all files are present at build time.
    await step.run("sync-files-to-sandbox", async () => {
      const files = result.state.data.files
      if (!files || Object.keys(files).length === 0) {
        console.warn("No files in state to sync — agent may not have written any files.")
        return
      }

      const sandbox = await Sandbox.connect(sandboxId)
      for (const [path, content] of Object.entries(files)) {
        console.log(`Syncing file: ${path}`)
        await sandbox.files.write(path, content)
      }
      console.log(`Synced ${Object.keys(files).length} files to sandbox.`)
    })

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "Generate a title for the fragment",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "stepfun/step-3.5-flash:free",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generate a response for the fragment",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "stepfun/step-3.5-flash:free",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((c) => c).join("");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here you go";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((c) => c).join("");
      } else {
        return responseOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0

    const sandboxUrl = await step.run("Get sandbox URL", async () => {
      const sandbox = await Sandbox.connect(sandboxId)
      await sandbox.setTimeout(60000 * 15)
      await sandbox.commands.run("cd /home/user && npx next build", {
        onStdout: (data) => console.log(data),
        onStderr: (data) => console.log(data),
      })

      sandbox.commands.run("cd /home/user && npx next start -p 3000").catch(() => {})

      const host = await sandbox.getHost(3000)
      const url = `https://${host}`

      let attempts = 0
      while (attempts < 20) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
          if (res.status !== 502 && res.status !== 503) return url
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++
      }
      return url
    })

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: MessageRole.ASSISTANT,
            type: MessageType.ERROR,
          },
        })
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragments: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      })
    })

    return {
      url: sandboxUrl,
      title: generateFragmentTitle(),
      files: result.state.data.files,
      summary: result.state.data.summary,
    }
  },
)
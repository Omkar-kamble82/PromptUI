import { Template, waitForPort, defaultBuildLogger, waitForURL } from "e2b"

const template = Template()
  .fromImage("node:21-slim")
  .aptInstall(["curl"])
  .runCmd("mkdir -p /home/user/nextjs-app")
  .runCmd("cd /home/user/nextjs-app && npx --yes create-next-app@16.1.6 . --yes")
  .runCmd("mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app")
  .setWorkdir("/home/user")
  .setStartCmd("npx next dev --turbopack", waitForURL("http://localhost:3000"))

const result = await Template.build(template, "prompui-nextjs-v0-build", {
  onBuildLogs: defaultBuildLogger(),
})

console.log("✅ Template built successfully!")
console.log("🆔 Template ID:", result.templateId)
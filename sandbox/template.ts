import { Template, waitForPort, defaultBuildLogger } from "e2b"

const template = Template()
  .fromImage("node:21-slim")
  .aptInstall(["curl"])
  .runCmd("mkdir -p /home/user/nextjs-app")
  .runCmd("cd /home/user/nextjs-app && npx --yes create-next-app@16.1.6 . --yes")
  .setStartCmd("cd /home/user/nextjs-app && npx next dev --turbopack", waitForPort(3000))

await Template.build(template, "prompui-nextjs-v0-build", {
  onBuildLogs: defaultBuildLogger(),
})

console.log("✅ Template built successfully!")

import { Template, waitForPort, defaultBuildLogger } from "e2b"

const template = Template()
  .fromImage("node:21-slim")
  .aptInstall(["curl"])
  .runCmd("mkdir -p /home/user/nextjs-app")
  .runCmd("cd /home/user/nextjs-app && npx --yes create-next-app@16.1.6 . --yes")
  .runCmd("cd /home/user/nextjs-app && npx --yes shadcn@4.0.5 init --yes --defaults --force")
  .runCmd("cd /home/user/nextjs-app && npx --yes shadcn@4.0.5 add button card input label textarea badge avatar separator dialog select tabs tooltip popover dropdown-menu sheet navigation-menu progress skeleton switch checkbox radio-group accordion alert --yes")
  .runCmd("mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app")
  .setStartCmd("cd /home/user && npx next dev --turbopack", waitForPort(3000))

const result = await Template.build(template, "prompui-nextjs-v0-build", {
  onBuildLogs: defaultBuildLogger(),
})

console.log("✅ Template built successfully!")
console.log("🆔 Template ID:", result.templateId)
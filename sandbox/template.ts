import { Template, waitForPort, defaultBuildLogger, waitForURL, waitForTimeout } from "e2b"

const template = Template()
  .fromNodeImage('21-slim')
  .setWorkdir('/home/user/nextjs-app')
  .runCmd('npx --yes create-next-app@16.1.6 . --ts --tailwind --no-eslint --import-alias "@/*" --use-npm --app --no-src-dir --yes')
  .runCmd('mv /home/user/nextjs-app/* /home/user/ && rm -rf /home/user/nextjs-app')
  .setWorkdir('/home/user')
  .setStartCmd('tail -f /dev/null', waitForTimeout(3000))
  
const result = await Template.build(template, "prompui-nextjs-v0-build", {
  onBuildLogs: defaultBuildLogger(),
})

console.log("✅ Template built successfully!")
console.log("🆔 Template ID:", result.templateId)
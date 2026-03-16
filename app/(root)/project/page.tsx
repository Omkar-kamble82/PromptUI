export const dynamic = "force-dynamic";

import AuthNav from "@/components/Shared/AuthNavbar"
import ProjectBuilder from "@/components/Shared/Project-builder"

type Props = {}

const page = (props: Props) => {


  return (
    <div>
      <AuthNav/>
      <div className="flex justify-center items-center p-4 flex-col gap-2">
        <ProjectBuilder/>
      </div>
    </div>
  )
}

export default page
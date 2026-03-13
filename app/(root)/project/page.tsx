import AuthNav from "@/components/Shared/AuthNavbar"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import ProjectForm from "@/components/Shared/ProjectForm"
import ProjectBuilder from "@/components/Shared/Project-builder"

type Props = {}

const page = (props: Props) => {


  return (
    <div>
      <AuthNav/>
      <div className="flex justify-center items-center p-4 flex-col gap-2">
        <ProjectBuilder/>
        <Separator className="bg-[#ff4136]/40" />
      </div>
    </div>
  )
}

export default page
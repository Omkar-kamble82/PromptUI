import AuthNav from "@/components/Shared/AuthNavbar"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import ProjectForm from "@/components/Shared/ProjectForm"
import ProjectBuilder from "@/components/Shared/Project-builder"
import MyProjects from "@/components/Shared/Myproject"

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
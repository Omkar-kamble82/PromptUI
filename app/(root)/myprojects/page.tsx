export const dynamic = "force-dynamic";

import AuthNav from '@/components/Shared/AuthNavbar'
import MyProjects from '@/components/Shared/Myproject'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
        <AuthNav/>
        <MyProjects/>
    </div>
  )
}

export default page
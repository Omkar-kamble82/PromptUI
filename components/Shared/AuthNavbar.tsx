import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/button'

type Props = {}

const AuthNav = async (props: Props) => {
    const user = await currentUser()
  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-2xl">
        <Link href="/project"><Image src={'/logo.png'} alt="Logo" width={180} height={50}/></Link>
        <div className='flex items-center gap-1'>
          <Link href="/myprojects"><Button className=" bg-[#ff4136] border-2 hover:bg-[#e6392f] px-2 py-4 text-sm rounded-xl text-white cursor-pointer md:text-md">My Projects</Button></Link>
          {user && <UserButton/>}
        </div>
    </nav>
  )
}

export default AuthNav
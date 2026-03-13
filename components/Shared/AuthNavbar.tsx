import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'

type Props = {}

const AuthNav = async (props: Props) => {
    const user = await currentUser()
  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-2xl">
        <Link href="/project"><Image src={'/logo.png'} alt="Logo" width={180} height={50}/></Link>
        {user && <UserButton/>}
    </nav>
  )
}

export default AuthNav
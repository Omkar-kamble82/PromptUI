import Image from 'next/image'
import Link from 'next/link'

type Props = {}

const Navbar = async (props: Props) => {
  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-2xl">
        <Link href="/"><Image src={'/logo.png'} alt="Logo" width={180} height={50}/></Link>
    </nav>
  )
}

export default Navbar
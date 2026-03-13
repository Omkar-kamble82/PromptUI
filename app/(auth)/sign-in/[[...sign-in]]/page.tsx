import Navbar from '@/components/Shared/Navbar'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <SignIn />
      </div>
    </div>
  )
}
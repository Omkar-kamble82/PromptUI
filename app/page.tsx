import Navbar from "@/components/Shared/Navbar";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {

  const user = await currentUser()
  if (user) {
    redirect('/project')
    return
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center flex-col text-center p-4">
        <Image src="/hero.png" alt="PromptUI-Banner" width={450} height={450} className="mb-3 rounded-2xl"/>
        <h1 className="text-xl font-bold mb-2 md:text-2xl">
          <span className="text-[#ff4136]">PromptUI</span> - Instantly Generate Beautiful UI Components with AI
        </h1>
        <p className="text-gray-500 mb-4 text-[12px] md:text-[13px]">
          PromptUI is a developer-focused platform that turns simple text prompts into functional user interface components and layouts. By describing the UI you want in plain language, PromptUI generates structured, production-ready code that helps speed up the design and development process. It is designed for developers and builders who want to quickly prototype interfaces, experiment with ideas, or scaffold UI without starting from scratch. PromptUI streamlines the path from concept to implementation by combining AI generation with modern frontend practices.
        </p>
        <div className="flex gap-4 justify-center max-w-md">
          <Link href="/sign-up" className="flex-1">
            <Button variant="outline" className="w-37 border-2 border-[#ff4136] text-[#ff4136] py-6 text-lg rounded-xl cursor-pointer">
              Sign Up
            </Button>
          </Link>
          <Link href="/sign-in" className="flex-1">
            <Button className="w-37 bg-[#ff4136] border-2 hover:bg-[#e6392f] py-6 text-lg rounded-xl text-white cursor-pointer">
              Sign In
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
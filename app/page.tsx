import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <nav className="flex items-center justify-between px-4 py-2 shadow-2xl">
      <Image src={'/logo.png'} alt="Logo" width={180} height={50} />
    </nav>
  );
}

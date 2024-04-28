import Link from "next/link";
import Image from 'next/image';
import { ModeToggle } from "./ModeToggle";
import { InfinityLogo } from "./icons/InfinityLogo";


export default function Navbar() {
  return (
    <nav className="w-full relative flex items-center justify-between mx-auto px-4 py-2 border-b text-slate-400">
      <Link href="/" className="flex flex-column font-bold text-3xl items-center gap-3">
        <InfinityLogo />
        {/* <Image src="/infinity.svg"  alt="אלוהים אדם ומכונה"  width={50} height={25} /> */}
        <span className="text-sm">אלוהים אדם ומכונה</span>
      </Link>
      <ModeToggle />
    </nav>
  );
}

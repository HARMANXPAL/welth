import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import Image from "next/image";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
         <Image
  src="/logo.png"
  alt="Welth Logo"
  width={200}
  height={60}
  className="h-12 w-auto object-contain"
/>
        </Link>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{
              elements: { avatarBox: "w-10 h-10" },
            }} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
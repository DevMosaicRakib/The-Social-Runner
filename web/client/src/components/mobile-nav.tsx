import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Map, User, Calendar } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function MobileNav() {
  const isMobile = useIsMobile();
  const [isHome] = useRoute("/");

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40">
      <div className="grid grid-cols-4 py-2">
        <a href="/#events-near-me">
          <Button
            variant="ghost"
            className={`flex flex-col items-center py-2 h-auto ${
              isHome ? "text-[hsl(14,100%,60%)]" : "text-slate-400"
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Find Events</span>
          </Button>
        </a>
        
        <Link href="/calendar">
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto text-slate-400">
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Calendar</span>
          </Button>
        </Link>
        
        <Link href="/create-visual">
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto text-slate-400">
            <Map className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Create</span>
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto text-slate-400">
            <User className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

import { Heart, Users, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface JigsawConnectionProps {
  className?: string;
  opacity?: number;
  showIcons?: boolean;
}

export default function JigsawConnection({ 
  className, 
  opacity = 0.1, 
  showIcons = true 
}: JigsawConnectionProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="runningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="mentalHealthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="communityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Running Piece (Left) */}
        <path
          d="M20 80 
             L20 200
             L80 200
             C85 195, 95 195, 100 200
             L120 200
             L120 180
             C125 175, 135 175, 140 180
             L140 120
             C135 115, 125 115, 120 120
             L120 100
             L100 100
             C95 105, 85 105, 80 100
             L20 100
             Z"
          fill="url(#runningGradient)"
          stroke="#f97316"
          strokeWidth="1"
          className="drop-shadow-sm"
        />
        
        {/* Mental Health Piece (Center) */}
        <path
          d="M140 80
             L140 120
             C135 115, 125 115, 120 120
             L120 180
             C125 175, 135 175, 140 180
             L140 200
             L200 200
             L200 180
             C205 175, 215 175, 220 180
             L220 120
             C215 115, 205 115, 200 120
             L200 100
             L180 100
             C175 105, 165 105, 160 100
             L140 100
             Z"
          fill="url(#mentalHealthGradient)"
          stroke="#22c55e"
          strokeWidth="1"
          className="drop-shadow-sm"
        />
        
        {/* Community Piece (Right) */}
        <path
          d="M220 80
             L220 120
             C215 115, 205 115, 200 120
             L200 180
             C205 175, 215 175, 220 180
             L220 200
             L280 200
             L280 100
             L260 100
             C255 105, 245 105, 240 100
             L220 100
             Z"
          fill="url(#communityGradient)"
          stroke="#3b82f6"
          strokeWidth="1"
          className="drop-shadow-sm"
        />
        
        {/* Subtle connecting lines */}
        <g stroke="#64748b" strokeWidth="0.5" opacity="0.3">
          <line x1="140" y1="140" x2="160" y2="140" strokeDasharray="2,2" />
          <line x1="200" y1="140" x2="220" y2="140" strokeDasharray="2,2" />
        </g>
      </svg>
      
      {/* Icon overlays */}
      {showIcons && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center justify-between w-full max-w-xs px-8">
            <div className="text-orange-600 opacity-60">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-green-600 opacity-60">
              <Heart className="w-6 h-6" />
            </div>
            <div className="text-blue-600 opacity-60">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface JigsawConnectionMiniProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function JigsawConnectionMini({ 
  className, 
  size = "md" 
}: JigsawConnectionMiniProps) {
  const sizeClasses = {
    sm: "w-16 h-12",
    md: "w-24 h-18",
    lg: "w-32 h-24"
  };

  return (
    <div className={cn("inline-block", sizeClasses[size], className)}>
      <svg viewBox="0 0 100 75" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Simplified 3-piece mini jigsaw */}
        <path
          d="M5 20 L5 55 L25 55 C27 53, 30 53, 32 55 L35 55 L35 45 C37 43, 40 43, 42 45 L42 35 C40 33, 37 33, 35 35 L35 25 L32 25 C30 27, 27 27, 25 25 L5 25 Z"
          fill="#f97316"
          opacity="0.6"
          stroke="#f97316"
          strokeWidth="0.5"
        />
        <path
          d="M35 20 L35 35 C37 33, 40 33, 42 35 L42 45 C40 43, 37 43, 35 45 L35 55 L55 55 L55 45 C57 43, 60 43, 62 45 L62 35 C60 33, 57 33, 55 35 L55 25 L52 25 C50 27, 47 27, 45 25 L35 25 Z"
          fill="#22c55e"
          opacity="0.6"
          stroke="#22c55e"
          strokeWidth="0.5"
        />
        <path
          d="M62 20 L62 35 C60 33, 57 33, 55 35 L55 45 C57 43, 60 43, 62 45 L62 55 L82 55 L82 25 L72 25 C70 27, 67 27, 65 25 L62 25 Z"
          fill="#3b82f6"
          opacity="0.6"
          stroke="#3b82f6"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}
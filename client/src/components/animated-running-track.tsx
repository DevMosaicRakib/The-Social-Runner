export default function AnimatedRunningTrack() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15">
      {/* Main Running Track */}
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Enhanced Track Background with Realistic Texture */}
        <defs>
          <linearGradient id="trackSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.6"/>
            <stop offset="50%" stopColor="#ea580c" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7"/>
          </linearGradient>
          
          <pattern id="trackTexture" patternUnits="userSpaceOnUse" width="60" height="30">
            <rect width="60" height="30" fill="url(#trackSurface)" opacity="0.4"/>
            <rect x="0" y="12" width="30" height="6" fill="#ea580c" opacity="0.7"/>
            <rect x="30" y="12" width="30" height="6" fill="transparent"/>
            {/* Track surface granular texture */}
            <circle cx="10" cy="8" r="1" fill="#dc2626" opacity="0.4"/>
            <circle cx="25" cy="22" r="0.8" fill="#dc2626" opacity="0.5"/>
            <circle cx="45" cy="15" r="1.2" fill="#dc2626" opacity="0.3"/>
            <circle cx="55" cy="25" r="0.9" fill="#dc2626" opacity="0.4"/>
          </pattern>
          
          {/* Realistic animated lane markers */}
          <pattern id="laneMarkers" patternUnits="userSpaceOnUse" width="40" height="8">
            <rect width="40" height="8" fill="transparent"/>
            <rect x="0" y="3" width="20" height="2" fill="#fbbf24" opacity="0.9">
              <animateTransform 
                attributeName="transform" 
                type="translateX" 
                values="0;40;0" 
                dur="4s" 
                repeatCount="indefinite"
              />
            </rect>
          </pattern>
          
          {/* Stadium lighting gradient */}
          <radialGradient id="stadiumLight" cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3"/>
            <stop offset="70%" stopColor="#f97316" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.1"/>
          </radialGradient>
        </defs>
        
        {/* Stadium lighting overlay */}
        <ellipse cx="400" cy="100" rx="300" ry="200" fill="url(#stadiumLight)" opacity="0.6"/>
        
        {/* Main professional running track */}
        <path
          d="M 100 300 Q 200 100, 400 150 Q 600 200, 700 300 Q 600 400, 400 450 Q 200 500, 100 300 Z"
          fill="url(#trackTexture)"
          stroke="#dc2626"
          strokeWidth="4"
          opacity="0.8"
        />
        
        {/* Track lane divisions with realistic markings */}
        <path
          d="M 150 300 Q 220 150, 400 180 Q 580 210, 650 300 Q 580 390, 400 420 Q 220 450, 150 300 Z"
          fill="none"
          stroke="url(#laneMarkers)"
          strokeWidth="3"
          opacity="0.8"
        />
        
        <path
          d="M 200 300 Q 240 200, 400 210 Q 560 220, 600 300 Q 560 380, 400 390 Q 240 400, 200 300 Z"
          fill="none"
          stroke="url(#laneMarkers)"
          strokeWidth="3"
          opacity="0.8"
        />
        
        <path
          d="M 250 300 Q 260 240, 400 240 Q 540 240, 550 300 Q 540 360, 400 360 Q 260 360, 250 300 Z"
          fill="none"
          stroke="url(#laneMarkers)"
          strokeWidth="2"
          opacity="0.7"
        />
        
        {/* Starting/finish line */}
        <rect x="395" y="140" width="10" height="60" fill="#fbbf24" opacity="0.9"/>
        <rect x="385" y="148" width="30" height="4" fill="#fbbf24" opacity="0.9"/>
        <rect x="385" y="188" width="30" height="4" fill="#fbbf24" opacity="0.9"/>
        
        {/* Realistic animated athletes */}
        <g className="animate-track-runner-1">
          {/* Runner 1 - Detailed figure */}
          <g opacity="0.9">
            <circle cx="0" cy="-15" r="6" fill="#fbbf24"/>
            <ellipse cx="0" cy="-3" rx="4" ry="10" fill="#3b82f6"/>
            <ellipse cx="-6" cy="-6" rx="2" ry="6" fill="#fbbf24" transform="rotate(-20)"/>
            <ellipse cx="6" cy="-8" rx="2" ry="6" fill="#fbbf24" transform="rotate(25)"/>
            <ellipse cx="-3" cy="8" rx="2.5" ry="12" fill="#1f2937" transform="rotate(-10)"/>
            <ellipse cx="3" cy="6" rx="2.5" ry="10" fill="#1f2937" transform="rotate(15)"/>
            <ellipse cx="-4" cy="18" rx="3" ry="2" fill="#dc2626" transform="rotate(-10)"/>
            <ellipse cx="5" cy="15" rx="3" ry="2" fill="#dc2626" transform="rotate(15)"/>
            <animateMotion dur="12s" repeatCount="indefinite" rotate="auto">
              <mpath href="#runnerPath1"/>
            </animateMotion>
          </g>
          <path
            id="runnerPath1"
            d="M 250 280 Q 350 180, 500 220 Q 650 260, 650 300 Q 650 340, 500 380 Q 350 420, 250 280"
            fill="none"
            opacity="0"
          />
        </g>
        
        <g className="animate-track-runner-2">
          {/* Runner 2 - Different lane */}
          <g opacity="0.8">
            <circle cx="0" cy="-14" r="5" fill="#f87171"/>
            <ellipse cx="0" cy="-2" rx="3.5" ry="9" fill="#ef4444"/>
            <ellipse cx="-5" cy="-5" rx="1.8" ry="5" fill="#f87171" transform="rotate(15)"/>
            <ellipse cx="5" cy="-7" rx="1.8" ry="5" fill="#f87171" transform="rotate(-20)"/>
            <ellipse cx="-2" cy="7" rx="2" ry="10" fill="#1f2937" transform="rotate(-5)"/>
            <ellipse cx="2" cy="9" rx="2" ry="12" fill="#1f2937" transform="rotate(12)"/>
            <ellipse cx="-3" cy="16" rx="2.5" ry="1.5" fill="#7c3aed" transform="rotate(-5)"/>
            <ellipse cx="3" cy="19" rx="2.5" ry="1.5" fill="#7c3aed" transform="rotate(12)"/>
            <animateMotion dur="15s" repeatCount="indefinite" rotate="auto">
              <mpath href="#runnerPath2"/>
            </animateMotion>
          </g>
          <path
            id="runnerPath2"
            d="M 200 300 Q 280 200, 400 240 Q 520 280, 580 300 Q 520 320, 400 360 Q 280 400, 200 300"
            fill="none"
            opacity="0"
          />
        </g>
        
        <g className="animate-track-runner-3">
          {/* Runner 3 - Inner lane */}
          <g opacity="0.7">
            <circle cx="0" cy="-12" r="4" fill="#a78bfa"/>
            <ellipse cx="0" cy="-1" rx="3" ry="8" fill="#8b5cf6"/>
            <ellipse cx="-4" cy="-4" rx="1.5" ry="4" fill="#a78bfa" transform="rotate(10)"/>
            <ellipse cx="4" cy="-5" rx="1.5" ry="4" fill="#a78bfa" transform="rotate(-15)"/>
            <ellipse cx="-1" cy="6" rx="1.8" ry="8" fill="#1f2937"/>
            <ellipse cx="1" cy="8" rx="1.8" ry="10" fill="#1f2937" transform="rotate(8)"/>
            <ellipse cx="-2" cy="13" rx="2" ry="1.2" fill="#22c55e"/>
            <ellipse cx="2" cy="16" rx="2" ry="1.2" fill="#22c55e" transform="rotate(8)"/>
            <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
              <mpath href="#runnerPath3"/>
            </animateMotion>
          </g>
          <path
            id="runnerPath3"
            d="M 250 300 Q 280 250, 400 270 Q 520 290, 550 300 Q 520 310, 400 330 Q 280 350, 250 300"
            fill="none"
            opacity="0"
          />
        </g>
        
        {/* Track markings and start/finish line */}
        <line x1="100" y1="280" x2="100" y2="320" stroke="#fff" strokeWidth="4" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
        </line>
        <text x="85" y="340" fill="#f97316" fontSize="10" opacity="0.6" transform="rotate(-90, 85, 340)">START</text>
        
        {/* Finish line dashes */}
        <rect x="95" y="285" width="10" height="5" fill="#000" opacity="0.4"/>
        <rect x="95" y="295" width="10" height="5" fill="#fff" opacity="0.6"/>
        <rect x="95" y="305" width="10" height="5" fill="#000" opacity="0.4"/>
        <rect x="95" y="315" width="10" height="5" fill="#fff" opacity="0.6"/>
      </svg>
      
      {/* Additional decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-orange-400 rounded-full opacity-30 animate-bounce" 
           style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
      <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-blue-400 rounded-full opacity-20 animate-pulse" 
           style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-25 animate-ping" 
           style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
    </div>
  );
}
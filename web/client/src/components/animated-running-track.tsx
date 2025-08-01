export default function AnimatedRunningTrack() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Main Running Track */}
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Track Background */}
        <defs>
          <pattern id="trackPattern" patternUnits="userSpaceOnUse" width="40" height="20">
            <rect width="40" height="20" fill="#f97316" opacity="0.3"/>
            <rect x="0" y="8" width="20" height="4" fill="#ea580c" opacity="0.5"/>
            <rect x="20" y="8" width="20" height="4" fill="transparent"/>
          </pattern>
          
          {/* Animated dashed line pattern for track lanes */}
          <pattern id="dashPattern" patternUnits="userSpaceOnUse" width="30" height="6">
            <rect width="30" height="6" fill="transparent"/>
            <rect x="0" y="2" width="15" height="2" fill="#fb923c" opacity="0.6">
              <animateTransform 
                attributeName="transform" 
                type="translateX" 
                values="0;30;0" 
                dur="3s" 
                repeatCount="indefinite"
              />
            </rect>
          </pattern>
        </defs>
        
        {/* Curved running track */}
        <path
          d="M 100 300 Q 200 100, 400 150 Q 600 200, 700 300 Q 600 400, 400 450 Q 200 500, 100 300 Z"
          fill="url(#trackPattern)"
          stroke="#f97316"
          strokeWidth="3"
          opacity="0.4"
        />
        
        {/* Inner track lanes */}
        <path
          d="M 150 300 Q 220 150, 400 180 Q 580 210, 650 300 Q 580 390, 400 420 Q 220 450, 150 300 Z"
          fill="none"
          stroke="url(#dashPattern)"
          strokeWidth="2"
          opacity="0.5"
        />
        
        <path
          d="M 200 300 Q 240 200, 400 210 Q 560 220, 600 300 Q 560 380, 400 390 Q 240 400, 200 300 Z"
          fill="none"
          stroke="url(#dashPattern)"
          strokeWidth="2"
          opacity="0.5"
        />
        
        {/* Animated running figures */}
        <g className="animate-track-runner-1">
          <circle cx="250" cy="280" r="8" fill="#fbbf24" opacity="0.7">
            <animateMotion dur="8s" repeatCount="indefinite">
              <mpath href="#runnerPath1"/>
            </animateMotion>
          </circle>
          <path
            id="runnerPath1"
            d="M 250 280 Q 350 180, 500 220 Q 650 260, 650 300 Q 650 340, 500 380 Q 350 420, 250 280"
            fill="none"
            opacity="0"
          />
        </g>
        
        <g className="animate-track-runner-2">
          <circle cx="400" cy="350" r="6" fill="#22d3ee" opacity="0.6">
            <animateMotion dur="12s" repeatCount="indefinite">
              <mpath href="#runnerPath2"/>
            </animateMotion>
          </circle>
          <path
            id="runnerPath2"
            d="M 400 350 Q 280 400, 180 300 Q 280 200, 400 250 Q 520 200, 620 300 Q 520 400, 400 350"
            fill="none"
            opacity="0"
          />
        </g>
        
        <g className="animate-track-runner-3">
          <circle cx="500" cy="320" r="7" fill="#a78bfa" opacity="0.6">
            <animateMotion dur="10s" repeatCount="indefinite">
              <mpath href="#runnerPath3"/>
            </animateMotion>
          </circle>
          <path
            id="runnerPath3"
            d="M 500 320 Q 400 220, 250 260 Q 150 300, 250 340 Q 400 380, 500 320"
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
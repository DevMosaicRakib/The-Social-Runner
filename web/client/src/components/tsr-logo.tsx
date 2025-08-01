interface TSRLogoProps {
  size?: number;
  className?: string;
}

export default function TSRLogo({ size = 40, className = "" }: TSRLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 60 60" 
      className={className}
    >
      {/* Background circle */}
      <circle 
        cx="30" 
        cy="30" 
        r="28" 
        fill="#f97316" 
        stroke="#ea580c" 
        strokeWidth="2"
      />
      
      {/* Inner running track */}
      <circle 
        cx="30" 
        cy="30" 
        r="20" 
        fill="none" 
        stroke="white" 
        strokeWidth="2" 
        strokeDasharray="3,2" 
        opacity="0.8"
      />
      
      {/* Letters TSR with playful colors and tilted design */}
      <g fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold">
        {/* T - Yellow with black border, slightly tilted left */}
        <text x="13" y="22" fontSize="10" textAnchor="middle" fill="black" stroke="black" strokeWidth="0.5" transform="rotate(-5 13 22)">T</text>
        <text x="13" y="22" fontSize="10" textAnchor="middle" fill="#fbbf24" transform="rotate(-5 13 22)">T</text>
        
        {/* S - Light blue with black border, straight */}
        <text x="30" y="21" fontSize="11" textAnchor="middle" fill="black" stroke="black" strokeWidth="0.5">S</text>
        <text x="30" y="21" fontSize="11" textAnchor="middle" fill="#60a5fa">S</text>
        
        {/* R - Pink with black border, slightly tilted right */}
        <text x="47" y="22" fontSize="10" textAnchor="middle" fill="black" stroke="black" strokeWidth="0.5" transform="rotate(5 47 22)">R</text>
        <text x="47" y="22" fontSize="10" textAnchor="middle" fill="#f472b6" transform="rotate(5 47 22)">R</text>
      </g>
      
      {/* Fun decorative elements around letters */}
      <g opacity="0.8">
        {/* Star near T */}
        <polygon points="10,12 11,15 14,15 11.5,17 12.5,20 10,18 7.5,20 8.5,17 6,15 9,15" fill="#fbbf24"/>
        
        {/* Circle near S */}
        <circle cx="30" cy="12" r="2" fill="#60a5fa"/>
        
        {/* Triangle near R */}
        <polygon points="50,12 52,16 48,16" fill="#f472b6"/>
      </g>
      
      {/* Cartoon runner figure - more colorful */}
      <g transform="translate(30,37)">
        {/* Head */}
        <circle cx="0" cy="-8" r="4" fill="#fbbf24"/>
        
        {/* Body */}
        <rect x="-2" y="-4" width="4" height="8" fill="#60a5fa" rx="2"/>
        
        {/* Legs in running position */}
        <rect x="-3" y="4" width="2" height="6" fill="#1f2937" rx="1"/>
        <rect x="1" y="4" width="2" height="6" fill="#1f2937" rx="1"/>
        
        {/* Arms in running position */}
        <rect x="-5" y="-2" width="3" height="1.5" fill="#fbbf24" rx="0.5"/>
        <rect x="2" y="-2" width="3" height="1.5" fill="#fbbf24" rx="0.5"/>
        
        {/* Enhanced motion lines with colors */}
        <g opacity="0.7">
          <line x1="-8" y1="1" x2="-5" y2="1" stroke="#fbbf24" strokeWidth="1.5"/>
          <line x1="-9" y1="3" x2="-5" y2="3" stroke="#60a5fa" strokeWidth="1"/>
          <line x1="-7" y1="5" x2="-4" y2="5" stroke="#f472b6" strokeWidth="1"/>
        </g>
        
        {/* Happy face */}
        <circle cx="-1" cy="-9" r="0.5" fill="#1f2937"/>
        <circle cx="1" cy="-9" r="0.5" fill="#1f2937"/>
        <path d="M -1.5,-6.5 Q 0,-5.5 1.5,-6.5" stroke="#1f2937" strokeWidth="0.5" fill="none"/>
      </g>
      
      {/* Decorative dots around the circle */}
      <g fill="white" opacity="0.7">
        <circle cx="45" cy="15" r="1.5"/>
        <circle cx="15" cy="15" r="1.5"/>
        <circle cx="15" cy="45" r="1.5"/>
        <circle cx="45" cy="45" r="1.5"/>
      </g>
    </svg>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Share2, Facebook, Twitter, MessageCircle, Link, Mail } from "lucide-react";
import type { EventWithParticipants } from "@shared/schema";

interface SocialShareButtonProps {
  event: EventWithParticipants;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function SocialShareButton({ 
  event, 
  variant = "ghost", 
  size = "sm",
  className = "" 
}: SocialShareButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Create event URL for sharing
  const eventUrl = `${window.location.origin}/?event=${event.id}`;
  
  // Format event details for sharing
  const shareText = `Join me for "${event.title}" - ${event.distance} run on ${event.date} at ${event.time} in ${event.location}. Find more running events at The Social Runner!`;
  
  const shareTitle = `${event.title} - Running Event`;

  // Social media sharing functions
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToTwitter = () => {
    const tweetText = `🏃‍♀️ ${shareText}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const whatsappText = `${shareText} ${eventUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`Join me for: ${event.title}`);
    const body = encodeURIComponent(`Hi!\n\nI found this awesome running event and thought you might be interested:\n\n${shareText}\n\nClick here to see more details: ${eventUrl}\n\nHope to see you there!\n\nCheers,\n[Your name]`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = url;
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
        await navigator.clipboard.writeText(`${shareText} ${eventUrl}`);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = `${shareText} ${eventUrl}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      toast({
        title: "Link copied!",
        description: "Event details copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
    setIsOpen(false);
  };

  // Native Web Share API (for mobile devices)
  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: eventUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error occurred, fallback to dropdown
        // Native share cancelled or failed
      }
    }
  };

  // Use native share on mobile if available, otherwise show dropdown
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator && /Mobi|Android/i.test(navigator.userAgent)) {
      nativeShare();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`${className}`}
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share event</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareByEmail} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2 text-gray-600" />
          Share by Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Link className="h-4 w-4 mr-2 text-gray-600" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
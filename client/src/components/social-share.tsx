import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageSquare, Instagram } from "lucide-react";

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
  hashtags?: string[];
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  shareUrl: (text: string, url: string) => string;
  color: string;
}

export default function SocialShare({ 
  title, 
  description, 
  url = window.location.href, 
  hashtags = [], 
  className = "" 
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const shareText = `${title}\n\n${description}`;
  const hashtagText = hashtags.length > 0 ? `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
  const fullText = `${shareText}${hashtagText}`;

  const platforms: SharePlatform[] = [
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      shareUrl: (text, shareUrl) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Facebook", 
      icon: <Facebook className="w-5 h-5" />,
      shareUrl: (text, shareUrl) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      shareUrl: (text, shareUrl) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`,
      color: "bg-blue-700 hover:bg-blue-800"
    },
    {
      name: "WhatsApp",
      icon: <MessageSquare className="w-5 h-5" />,
      shareUrl: (text, shareUrl) => `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
      color: "bg-green-600 hover:bg-green-700"
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${fullText}\n\n${url}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share text and link copied successfully."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    const shareUrl = platform.shareUrl(fullText, url);
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    toast({
      title: `Shared to ${platform.name}!`,
      description: "Your training plan has been shared successfully."
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: fullText,
          url: url
        });
        toast({
          title: "Shared successfully!",
          description: "Your training plan has been shared."
        });
      } catch (error) {
        // User cancelled share or error occurred
        // Share cancelled or failed - handled gracefully
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 ${className}`}
        >
          <Share2 className="w-4 h-4" />
          Share Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Training Plan</DialogTitle>
          <DialogDescription>
            Share your personalised training plan with friends and social media
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Preview */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm space-y-2">
                <p className="font-semibold">{title}</p>
                <p className="text-gray-600">{description}</p>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="text-blue-600 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Native Share (if supported) */}
          {typeof navigator !== 'undefined' && navigator.share && typeof navigator.share === 'function' && (
            <Button 
              onClick={handleNativeShare}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}

          {/* Social Media Platforms */}
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <Button
                key={platform.name}
                onClick={() => handlePlatformShare(platform)}
                className={`flex items-center gap-2 text-white ${platform.color}`}
                size="sm"
              >
                {platform.icon}
                {platform.name}
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="border-t pt-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link & Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Training Plan specific sharing component
interface TrainingPlanShareProps {
  planName: string;
  planType: string;
  duration: number;
  currentWeek?: number;
  achievements?: string[];
  className?: string;
}

export function TrainingPlanShare({ 
  planName, 
  planType, 
  duration, 
  currentWeek, 
  achievements = [],
  className = "" 
}: TrainingPlanShareProps) {
  const progress = currentWeek ? Math.round((currentWeek / duration) * 100) : 0;
  const isCompleted = currentWeek === duration;
  
  const title = isCompleted 
    ? `🏃‍♂️ I just completed my ${planName}!` 
    : `🎯 I'm training with my personalised ${planName}`;
    
  const description = isCompleted
    ? `Just finished my ${duration}-week ${planType} training plan! From week 1 to ${duration}, every step was worth it. 💪`
    : currentWeek 
      ? `Currently on week ${currentWeek} of ${duration} (${progress}% complete) of my ${planType} training journey! 🔥`
      : `Starting my ${duration}-week personalised ${planType} training plan! Ready to crush my goals! 🚀`;

  const hashtags = [
    'RunningGoals',
    'TrainingPlan', 
    'RunnersCommunity',
    'FitnessJourney',
    'SocialRunner',
    planType.replace(/[^a-zA-Z0-9]/g, ''),
    ...(isCompleted ? ['GoalAchieved', 'TrainingComplete'] : ['InTraining']),
    ...achievements.map(achievement => achievement.replace(/[^a-zA-Z0-9]/g, ''))
  ].filter(Boolean);

  return (
    <SocialShare
      title={title}
      description={description}
      hashtags={hashtags}
      className={className}
    />
  );
}
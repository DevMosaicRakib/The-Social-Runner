import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EventReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

interface EventReactionsProps {
  eventId: number;
  initialReactions?: EventReaction[];
}

const EMOJI_OPTIONS = [
  "🏃", "💪", "🔥", "⚡", "🎯", "💯", "👏", "🚀", 
  "❤️", "😍", "🤩", "😎", "🙌", "✨", "🏆", "🌟"
];

export default function EventReactions({ eventId, initialReactions = [] }: EventReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reactions
  const { data: reactionsData } = useQuery({
    queryKey: ["/api/events", eventId, "reactions"],
    initialData: { reactions: initialReactions },
    staleTime: 30000, // 30 seconds
  });

  const reactions = reactionsData?.reactions || [];

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      return apiRequest("POST", `/api/events/${eventId}/reactions`, { emoji });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/events", eventId, "reactions"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEmojiPicker(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to react to events",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      return apiRequest("DELETE", `/api/events/${eventId}/reactions/${encodeURIComponent(emoji)}`);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/events", eventId, "reactions"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage reactions",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEmojiClick = async (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    
    if (existingReaction?.userReacted) {
      removeReactionMutation.mutate(emoji);
    } else {
      addReactionMutation.mutate(emoji);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    addReactionMutation.mutate(emoji);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Display existing reactions */}
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.userReacted ? "default" : "outline"}
          size="sm"
          className={`h-8 px-2 text-sm transition-all hover:scale-105 ${
            reaction.userReacted 
              ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" 
              : "hover:bg-orange-50 border-gray-200"
          }`}
          onClick={() => handleEmojiClick(reaction.emoji)}
          disabled={addReactionMutation.isPending || removeReactionMutation.isPending}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-orange-50 text-gray-500 hover:text-orange-600"
            disabled={addReactionMutation.isPending}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-orange-50 text-lg"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
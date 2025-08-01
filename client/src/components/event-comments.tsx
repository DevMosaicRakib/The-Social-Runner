import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Edit2, Trash2, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import type { EventCommentWithUser } from "@shared/schema";

interface EventCommentsProps {
  eventId: number;
}

const quickComments = [
  "I'll be there! 🏃‍♂️",
  "Looking forward to this! 💪",
  "Count me in! ✅",
  "Can't wait! 🔥",
  "This looks amazing! ⭐",
  "Perfect timing! ⏰"
];

export function EventComments({ eventId }: EventCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["/api/events", eventId, "comments"],
    queryFn: () => apiRequest(`/api/events/${eventId}/comments`),
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, isQuickComment }: { content: string; isQuickComment?: boolean }) => {
      return apiRequest("POST", `/api/events/${eventId}/comments`, { content, isQuickComment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      return apiRequest("PUT", `/api/comments/${commentId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
      setEditingId(null);
      setEditContent("");
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "comments"] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim() || !user) return;
    addCommentMutation.mutate({ content: newComment.trim() });
  };

  const handleQuickComment = (comment: string) => {
    if (!user) return;
    addCommentMutation.mutate({ content: comment, isQuickComment: true });
  };

  const handleEdit = (comment: EventCommentWithUser) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = (commentId: number) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ commentId, content: editContent.trim() });
  };

  const handleDelete = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-semibold">Comments</h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold">Comments</h3>
        <Badge variant="secondary" className="ml-auto">
          {comments.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Comments */}
        {user && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600">Quick comments:</h4>
            <div className="flex flex-wrap gap-2">
              {quickComments.map((comment) => (
                <Button
                  key={comment}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickComment(comment)}
                  disabled={addCommentMutation.isPending}
                  className="text-xs hover:bg-orange-50 hover:border-orange-200"
                >
                  {comment}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Add Comment Form */}
        {user && (
          <div className="space-y-3">
            <Separator />
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 border-2 border-gray-300">
                <AvatarImage src={user?.profileImageUrl || ""} />
                <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                  {getInitials(user?.firstName || "", user?.lastName || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 && (
          <div className="space-y-4">
            <Separator />
            {comments.map((comment: EventCommentWithUser) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 border-2 border-gray-300">
                  <AvatarImage src={comment.user.profileImageUrl} />
                  <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                    {getInitials(comment.user.firstName, comment.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    {comment.isQuickComment && (
                      <Badge variant="secondary" className="text-xs">
                        Quick
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </div>
                    {user?.id === comment.userId && (
                      <div className="flex gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(comment)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => comment.id && handleDelete(comment.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id && comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] resize-none"
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {editContent.length}/500 characters
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => comment.id && handleUpdate(comment.id)}
                            disabled={!editContent.trim() || updateCommentMutation.isPending}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to share your thoughts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TSRLogo from "@/components/tsr-logo";

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-2xl border-orange-200">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <TSRLogo size={64} className="animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            Welcome to The Social Runner
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-gray-600 font-medium">Loading your running community...</p>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
          
          <div className="mt-6 text-xs text-gray-500">
            Connecting runners, building community
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
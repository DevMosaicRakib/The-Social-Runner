import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Eye, Clock, Share2 } from "lucide-react";
import { NewsArticle } from "@shared/schema";

export function NewsArticlePage() {
  const [match, params] = useRoute("/news/:slug");
  const slug = params?.slug;

  const { data: article, isLoading, error } = useQuery<NewsArticle>({
    queryKey: ["/api/news", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-6 px-4 mobile-content-padding">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-6" />
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-6 px-4 mobile-content-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/news">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Back to News
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || '',
          url: window.location.href,
        });
      } catch (error) {
        // Share was cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <article className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link href="/news">
            <button className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </button>
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            {article.isSticky && (
              <div className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                📌 Pinned Article
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Article Meta & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(article.publishedAt || article.createdAt), "dd MMMM yyyy")}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewCount || 0} views</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{Math.ceil((article.content?.length || 0) / 200)} min read</span>
                </div>
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white rounded-lg p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-white rounded-lg p-6 text-center border border-orange-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Join The Social Runner Community
            </h3>
            <p className="text-gray-600 mb-4">
              Connect with fellow runners, discover events, and build lasting friendships through running.
            </p>
            <Link href="/">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                Explore Events
              </button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
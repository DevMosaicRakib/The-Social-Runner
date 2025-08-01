import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Eye, User, Clock, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsArticle } from "@shared/schema";

export function News() {
  const { data: articles, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-6 px-4 mobile-content-padding">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/2" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 border">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Navigation />
        <div className="container mx-auto py-6 px-4 mobile-content-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load News</h1>
            <p className="text-gray-600">There was an error loading the latest news articles. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 mobile-content-padding">
        <div className="max-w-4xl mx-auto">
          {/* Return Home Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Return Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
            </Link>
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Running Community News
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, tips, and stories from The Social Runner community
            </p>
          </div>

          {/* Articles */}
          <div className="space-y-6">
            {articles && articles.length > 0 ? (
              articles.map((article) => (
                <article
                  key={article.id}
                  className={`bg-white rounded-lg border hover:shadow-lg transition-shadow duration-200 overflow-hidden ${
                    article.isSticky ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                  }`}
                >
                  {article.isSticky && (
                    <div className="bg-orange-100 px-4 py-2 border-b border-orange-200">
                      <span className="text-sm font-medium text-orange-800">📌 Pinned</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Article Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/news/${article.slug}`}>
                          <h2 className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition-colors cursor-pointer mb-2">
                            {article.title}
                          </h2>
                        </Link>
                        
                        {/* Article Meta */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(article.publishedAt || article.createdAt || Date.now()), "dd MMM yy")}
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
                      </div>
                      
                      {article.featuredImage && (
                        <div className="ml-6 flex-shrink-0">
                          <img
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Article Excerpt */}
                    {article.excerpt && (
                      <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read More */}
                    <Link href={`/news/${article.slug}`}>
                      <button className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors">
                        Read full article
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Articles Yet</h3>
                <p className="text-gray-600">
                  We're working on bringing you the latest running community updates. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* Load More (Pagination placeholder) */}
          {articles && articles.length >= 10 && (
            <div className="text-center mt-8">
              <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
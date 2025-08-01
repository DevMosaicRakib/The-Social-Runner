import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, ArrowRight, Smartphone } from "lucide-react";
import { Link } from "wouter";

interface RegistrationSuccessProps {
  userEmail?: string;
  userName?: string;
}

export default function RegistrationSuccessPage() {
  const [location, setLocation] = useLocation();
  const [userInfo, setUserInfo] = useState<{email?: string, name?: string}>({});

  useEffect(() => {
    // Try to get user info from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    
    if (email || name) {
      setUserInfo({ email: email || undefined, name: name || undefined });
    }
  }, []);

  const handleGoToLogin = () => {
    setLocation('/auth');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Mail className="h-16 w-16 text-orange-500" />
              <CheckCircle className="h-6 w-6 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Check Your Email!
          </CardTitle>
          
          <CardDescription className="text-lg">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {userInfo.email && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-sm text-orange-800">
                <strong>Verification email sent to:</strong><br />
                <span className="font-mono">{userInfo.email}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center text-gray-600">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ol className="text-sm space-y-2 text-left max-w-sm mx-auto">
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</span>
                  <span>Check your email inbox (and spam folder)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</span>
                  <span>Click the verification link in the email</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</span>
                  <span>Return here to sign in to your account</span>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Mobile App Users:</strong><br />
                  If you're using our mobile app, you can click the verification link from your phone's email app. 
                  It will automatically open and verify your account.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleGoToLogin} className="w-full bg-orange-500 hover:bg-orange-600">
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Sign In Page
            </Button>

            <Button onClick={handleGoHome} variant="ghost" className="w-full">
              Return to Home Page
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="text-center text-sm text-gray-500">
              <p><strong>Didn't receive the email?</strong></p>
              <p className="mt-1">
                Check your spam folder or{' '}
                <Link href="/auth" className="text-orange-600 hover:text-orange-700 font-medium">
                  try registering again
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center text-sm text-gray-600">
              <strong>🏃‍♀️ Welcome to The Social Runner Community!</strong><br />
              Once verified, you'll have access to events, training plans, and our running community across Australia.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
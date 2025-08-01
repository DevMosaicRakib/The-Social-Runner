import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Link } from "wouter";

export default function VerifyEmailPage() {
  const [match, params] = useRoute("/verify-email/:token");
  const [location, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (!match || !params?.token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${params.token}`);
        const data = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(data.message);
          setUserInfo(data.user);
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyEmail();
  }, [match, params?.token]);

  const handleGoToLogin = () => {
    setLocation('/auth');
  };

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verificationStatus === 'loading' && (
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {verificationStatus === 'loading' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
          
          <CardDescription>
            {verificationStatus === 'loading' && 'Please wait while we verify your email address...'}
            {verificationStatus === 'success' && 'Your email has been successfully verified. Welcome to The Social Runner!'}
            {verificationStatus === 'error' && 'We could not verify your email address.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {message}
          </div>

          {verificationStatus === 'success' && userInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-sm text-green-800">
                <strong>Welcome {userInfo.firstName}!</strong><br />
                Your account is now active.
              </div>
            </div>
          )}

          <div className="space-y-3">
            {verificationStatus === 'success' && (
              <Button onClick={handleGoToLogin} className="w-full bg-orange-500 hover:bg-orange-600">
                Sign In to Your Account
              </Button>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                  Try Signing In
                </Button>
                <div className="text-center">
                  <Link href="/auth" className="text-sm text-orange-600 hover:text-orange-700">
                    Request New Verification Email
                  </Link>
                </div>
              </div>
            )}

            <Button onClick={handleGoHome} variant="ghost" className="w-full">
              Return to Home Page
            </Button>
          </div>

          {verificationStatus === 'success' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <strong>What's next?</strong><br />
                  • Complete your runner profile<br />
                  • Discover events near you<br />
                  • Connect with local runners<br />
                  • Create your training plan
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
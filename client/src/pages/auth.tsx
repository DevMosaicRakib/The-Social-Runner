import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";
import { SiStrava } from "react-icons/si";
import { Mail, ArrowLeft } from "lucide-react";
import EmailAuthForms from "@/components/email-auth-forms";
import { useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [authMethod, setAuthMethod] = useState<'choose' | 'email' | 'register'>('choose');
  
  // Check for registration mode from URL or props
  const urlParams = new URLSearchParams(window.location.search);
  const isRegistrationMode = urlParams.get('mode') === 'register';

  if (authMethod === 'email' || authMethod === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4">
          <Button
            variant="ghost"
            onClick={() => setAuthMethod('choose')}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to options
          </Button>
          <EmailAuthForms 
            defaultMode={authMethod === 'register' || isRegistrationMode ? 'register' : 'login'}
            onSuccess={() => setLocation('/')} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">
            {isRegistrationMode ? 'Create Your Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isRegistrationMode 
              ? 'Join The Social Runner community and find your running tribe'
              : 'Sign in to your Social Runner account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email/Password Authentication */}
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
            size="lg"
            onClick={() => setAuthMethod(isRegistrationMode ? 'register' : 'email')}
          >
            <Mail className="mr-2 h-5 w-5" />
            {isRegistrationMode ? 'Create Account with Email' : 'Sign In with Email'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or connect with</span>
            </div>
          </div>
          
          {/* Strava Login */}
          <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            size="lg"
            onClick={() => window.location.href = '/api/auth/strava'}
          >
            <SiStrava className="mr-2 h-5 w-5" />
            Continue with Strava
          </Button>
          
          {/* Google Login */}
          <Button 
            variant="outline" 
            className="w-full border-slate-300 hover:bg-slate-50"
            size="lg"
            onClick={() => window.location.href = '/api/auth/google'}
          >
            <FaGoogle className="mr-2 h-5 w-5 text-red-500" />
            Continue with Google
          </Button>
          

          
          <div className="text-center text-xs text-slate-500 pt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            We'll use your activity data to help you find running partners.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { registerUserSchema, loginUserSchema, forgotPasswordSchema, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, MapPin, Calendar } from "lucide-react";
import { australianLocations } from "@shared/australianLocations";
import { z } from "zod";

type RegisterFormData = z.infer<typeof registerUserSchema>;
type LoginFormData = z.infer<typeof loginUserSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface EmailAuthFormsProps {
  onSuccess?: () => void;
  defaultMode?: 'login' | 'register';
}

export default function EmailAuthForms({ onSuccess, defaultMode = 'login' }: EmailAuthFormsProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      sex: undefined,
      dateOfBirth: "",
      location: "",
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Small delay to allow session to be established
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Account created!",
        description: data.message || "Welcome to The Social Runner!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Don't redirect automatically - user needs to sign in
      setAuthMode('login');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      return apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Reset link sent",
        description: "If an account exists with this email, you'll receive a reset link.",
      });
      setAuthMode('login');
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const onForgotPasswordSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (authMode === 'forgot') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAuthMode('login')}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
          </div>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...forgotPasswordForm.register("email")}
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
              {forgotPasswordForm.formState.errors.email && (
                <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (authMode === 'register') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...registerForm.register("firstName")}
                    id="firstName"
                    placeholder="John"
                    className="pl-10"
                  />
                </div>
                {registerForm.formState.errors.firstName && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...registerForm.register("lastName")}
                  id="lastName"
                  placeholder="Doe"
                />
                {registerForm.formState.errors.lastName && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...registerForm.register("email")}
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...registerForm.register("password")}
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            {/* Mandatory Profile Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select onValueChange={(value) => registerForm.setValue("sex", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {registerForm.formState.errors.sex && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.sex.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    {...registerForm.register("dateOfBirth")}
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                  />
                </div>
                {registerForm.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select onValueChange={(value) => registerForm.setValue("location", value)}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your Australian location" />
                  </SelectTrigger>
                  <SelectContent>
                    {australianLocations.map((location) => (
                      <SelectItem key={location.value} value={location.label}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {registerForm.formState.errors.location && (
                <p className="text-sm text-red-600">{registerForm.formState.errors.location.message}</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setAuthMode('login')}
                className="text-sm"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                {...loginForm.register("email")}
                id="login-email"
                type="email"
                placeholder="your@email.com"
                className="pl-10"
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                {...loginForm.register("password")}
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              onClick={() => setAuthMode('forgot')}
              className="text-sm px-0"
            >
              Forgot password?
            </Button>
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setAuthMode('register')}
              className="text-sm"
            >
              Don't have an account? Create one
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
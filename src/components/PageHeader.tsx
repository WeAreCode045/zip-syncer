import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface PageHeaderProps {
  onAddClick: () => void;
}

const PageHeader = ({ onAddClick }: PageHeaderProps) => {
  const { user, signIn, signInWithEmail, signUp, signOut } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async () => {
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({
          title: "Success",
          description: "Please check your email to confirm your account",
        });
      } else {
        await signInWithEmail(email, password);
        toast({
          title: "Success",
          description: "Successfully signed in",
        });
      }
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plugin Library</h1>
        <p className="text-muted-foreground mt-2">
          Manage and distribute your WordPress plugins
        </p>
      </div>
      <div className="flex gap-2">
        {user ? (
          <>
            <Button
              onClick={onAddClick}
              className="transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Plugin
            </Button>
            <Button
              variant="outline"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleEmailAuth}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={signIn} variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In with GitHub
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
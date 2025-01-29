import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface PageHeaderProps {
  onAddClick: () => void;
}

const PageHeader = ({ onAddClick }: PageHeaderProps) => {
  const { user, signIn, signOut } = useAuth();

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
          <Button onClick={signIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
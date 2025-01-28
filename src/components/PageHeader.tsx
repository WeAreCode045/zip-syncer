import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  onAddClick: () => void;
}

const PageHeader = ({ onAddClick }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plugin Library</h1>
        <p className="text-muted-foreground mt-2">
          Manage and distribute your WordPress plugins
        </p>
      </div>
      <Button
        onClick={onAddClick}
        className="transition-all duration-300"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Plugin
      </Button>
    </div>
  );
};

export default PageHeader;
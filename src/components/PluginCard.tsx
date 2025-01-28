import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2 } from "lucide-react";

interface PluginCardProps {
  name: string;
  version: string;
  description: string;
  uploadDate: string;
  onDownload: () => void;
  onDelete: () => void;
}

const PluginCard = ({
  name,
  version,
  description,
  uploadDate,
  onDownload,
  onDelete,
}: PluginCardProps) => {
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl">{name}</h3>
          <Badge variant="secondary" className="text-sm">
            v{version}
          </Badge>
        </div>
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDownload}
            className="hover:text-success hover:bg-success-50"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Uploaded: {uploadDate}
        </p>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
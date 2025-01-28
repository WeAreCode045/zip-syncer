import React, { useState } from 'react';
import PluginCard from '@/components/PluginCard';
import UploadForm from '@/components/UploadForm';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  uploadDate: string;
}

const Index = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { toast } = useToast();

  const handleUpload = async (formData: FormData) => {
    try {
      // TODO: Implement actual API call
      const mockPlugin = {
        id: Date.now().toString(),
        name: "Plugin Name",
        version: formData.get("version") as string,
        description: formData.get("description") as string,
        uploadDate: new Date().toLocaleDateString(),
      };

      setPlugins([mockPlugin, ...plugins]);
      setShowUploadForm(false);
      
      toast({
        title: "Success",
        description: "Plugin uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload plugin",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: string) => {
    setPlugins(plugins.filter(plugin => plugin.id !== id));
    toast({
      title: "Success",
      description: "Plugin deleted successfully",
    });
  };

  const handleDownload = (id: string) => {
    // TODO: Implement actual download logic
    toast({
      title: "Success",
      description: "Plugin download started",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plugin Library</h1>
            <p className="text-muted-foreground mt-2">
              Manage and distribute your WordPress plugins
            </p>
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Plugin
          </Button>
        </div>

        {showUploadForm && (
          <div className="border rounded-lg p-4 bg-card">
            <UploadForm onUpload={handleUpload} />
          </div>
        )}

        <div className="grid gap-4">
          {plugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              {...plugin}
              onDelete={() => handleDelete(plugin.id)}
              onDownload={() => handleDownload(plugin.id)}
            />
          ))}
          
          {plugins.length === 0 && !showUploadForm && (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">
                No plugins uploaded yet. Click "Add Plugin" to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
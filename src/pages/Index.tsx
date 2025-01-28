import React, { useState, useEffect } from 'react';
import PluginCard from '@/components/PluginCard';
import UploadForm from '@/components/UploadForm';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPlugins, getPluginDownloadUrl, verifyPluginVersion } from '@/utils/api';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  uploadDate: string;
}

const STORAGE_KEY = 'plugin_library_plugins';

const Index = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { toast } = useToast();

  // Load plugins from localStorage on component mount
  useEffect(() => {
    const storedPlugins = localStorage.getItem(STORAGE_KEY);
    if (storedPlugins) {
      setPlugins(JSON.parse(storedPlugins));
    }
  }, []);

  // Save plugins to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins));
  }, [plugins]);

  const handleUpload = async (formData: FormData) => {
    try {
      const mockPlugin = {
        id: Date.now().toString(),
        name: formData.get("file") as File ? (formData.get("file") as File).name.replace('.zip', '') : "Plugin Name",
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

  const handleDownload = async (id: string) => {
    try {
      const downloadUrl = getPluginDownloadUrl(id);
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Success",
        description: "Plugin download started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download plugin",
        variant: "destructive",
      });
    }
  };

  // API endpoint for WordPress plugin version check
  React.useEffect(() => {
    // Expose API endpoints for WordPress plugin
    if (typeof window !== 'undefined') {
      (window as any).pluginApi = {
        getPlugins,
        verifyPluginVersion,
        getPluginDownloadUrl,
      };
    }
  }, []);

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
import React, { useState, useEffect } from 'react';
import PluginCard from '@/components/PluginCard';
import UploadForm from '@/components/UploadForm';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPlugins, uploadPlugin, deletePlugin, getPluginDownloadUrl } from '@/utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  upload_date: string;
}

const Index = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch plugins using React Query
  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: getPlugins,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => {
      const file = formData.get('file') as File;
      const version = formData.get('version') as string;
      const description = formData.get('description') as string;
      return uploadPlugin(file, version, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setShowUploadForm(false);
      toast({
        title: "Success",
        description: "Plugin uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload plugin",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast({
        title: "Success",
        description: "Plugin deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete plugin",
        variant: "destructive",
      });
    },
  });

  const handleUpload = async (formData: FormData) => {
    uploadMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleDownload = async (id: string) => {
    try {
      const downloadUrl = await getPluginDownloadUrl(id);
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
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading plugins...</p>
            </div>
          ) : plugins.length > 0 ? (
            plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                {...plugin}
                onDelete={() => handleDelete(plugin.id)}
                onDownload={() => handleDownload(plugin.id)}
              />
            ))
          ) : (
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
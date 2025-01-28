import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlugins, uploadPlugin, deletePlugin, getPluginDownloadUrl } from '@/utils/api';
import PageHeader from '@/components/PageHeader';
import UploadFormSection from '@/components/UploadFormSection';
import PluginsGrid from '@/components/PluginsGrid';

const Index = () => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ['plugins'],
    queryFn: getPlugins,
  });

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload plugin",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast({
        title: "Success",
        description: "Plugin deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete plugin",
        variant: "destructive",
      });
    },
  });

  const handleUpload = (formData: FormData) => {
    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
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
        <PageHeader onAddClick={() => setShowUploadForm(!showUploadForm)} />
        <UploadFormSection show={showUploadForm} onUpload={handleUpload} />
        <PluginsGrid
          plugins={plugins}
          isLoading={isLoading}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default Index;
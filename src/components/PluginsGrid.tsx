import React from 'react';
import PluginCard from './PluginCard';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  upload_date: string;
  file_url: string;
}

interface PluginsGridProps {
  plugins: Plugin[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

const PluginsGrid = ({ plugins, isLoading, onDelete, onDownload }: PluginsGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading plugins...</p>
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <p className="text-muted-foreground">
          No plugins uploaded yet. Click "Add Plugin" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {plugins.map((plugin) => (
        <PluginCard
          key={plugin.id}
          {...plugin}
          onDelete={() => onDelete(plugin.id)}
          onDownload={() => onDownload(plugin.id)}
        />
      ))}
    </div>
  );
};

export default PluginsGrid;
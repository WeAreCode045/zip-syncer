import React from 'react';
import { Package, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkPluginInstallation, installPlugin } from '@/utils/api';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
}

interface PluginListProps {
  plugins: Plugin[];
}

const PluginList = ({ plugins }: PluginListProps) => {
  const { toast } = useToast();

  const handleInstall = async (pluginId: string, pluginName: string) => {
    try {
      const isInstalled = await checkPluginInstallation(pluginName);
      
      if (isInstalled) {
        toast({
          title: "Already Installed",
          description: `${pluginName} is already installed on your WordPress site.`,
        });
        return;
      }

      const success = await installPlugin(pluginId);
      
      if (success) {
        toast({
          title: "Success",
          description: `${pluginName} has been installed successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to install plugin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Available Plugins</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plugin</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plugins.map((plugin) => (
            <TableRow key={plugin.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {plugin.name}
                </div>
              </TableCell>
              <TableCell>{plugin.version}</TableCell>
              <TableCell>{plugin.description}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInstall(plugin.id, plugin.name)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PluginList;
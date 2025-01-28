interface PluginResponse {
  id: string;
  name: string;
  version: string;
  description: string;
  downloadUrl: string;
}

// Initialize an empty plugins array to store the data
const plugins: PluginResponse[] = [];

export const getPlugins = async (): Promise<PluginResponse[]> => {
  // This would typically fetch from your backend
  // For now, we'll return the plugins from state
  return plugins;
};

export const getPluginDownloadUrl = (pluginId: string): string => {
  // In a real implementation, this would generate a secure, temporary download URL
  return `/api/plugins/download/${pluginId}`;
};

export const verifyPluginVersion = async (
  pluginName: string,
  currentVersion: string
): Promise<{
  hasUpdate: boolean;
  latestVersion: string;
}> => {
  const plugins = await getPlugins();
  const plugin = plugins.find(p => p.name === pluginName);
  
  if (!plugin) {
    return { hasUpdate: false, latestVersion: currentVersion };
  }

  return {
    hasUpdate: plugin.version !== currentVersion,
    latestVersion: plugin.version
  };
};
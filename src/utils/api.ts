interface PluginResponse {
  id: string;
  name: string;
  version: string;
  description: string;
  downloadUrl: string;
  isInstalled?: boolean;
}

// Initialize an empty plugins array to store the data
const plugins: PluginResponse[] = [];

// Base URL for the API endpoints
const BASE_URL = window.location.origin;

export const getPlugins = async (): Promise<PluginResponse[]> => {
  // Return mock data for testing
  return [
    {
      id: "1",
      name: "Example Plugin",
      version: "1.0.0",
      description: "An example plugin for testing",
      downloadUrl: `${BASE_URL}/api/plugins/download/1`,
      isInstalled: false
    },
    {
      id: "2",
      name: "Test Plugin",
      version: "2.0.0",
      description: "A test plugin for demonstration",
      downloadUrl: `${BASE_URL}/api/plugins/download/2`,
      isInstalled: false
    }
  ];
};

export const getPluginDownloadUrl = (pluginId: string): string => {
  return `${BASE_URL}/api/plugins/download/${pluginId}`;
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

// Check if a plugin is installed
export const checkPluginInstallation = async (pluginName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/plugins/check-installation/${pluginName}`);
    const data = await response.json();
    return data.installed;
  } catch (error) {
    console.error('Error checking plugin installation:', error);
    return false;
  }
};

// Install a plugin
export const installPlugin = async (pluginId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/api/plugins/install/${pluginId}`, {
      method: 'POST',
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error installing plugin:', error);
    return false;
  }
};
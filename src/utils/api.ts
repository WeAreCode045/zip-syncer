import type { Database } from '@/integrations/supabase/types';

type Plugin = Database['public']['Tables']['plugins']['Row'];

const getServerSettings = () => {
  const settings = localStorage.getItem('serverSettings');
  if (!settings) {
    throw new Error('Server settings not configured');
  }
  return JSON.parse(settings);
};

export const getPlugins = async (): Promise<Plugin[]> => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const response = await fetch(`${serverUrl}/wp-json/lovable/v1/plugins`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plugins');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getPlugins:', error);
    throw error;
  }
};

export const uploadPlugin = async (file: File, version: string, description: string) => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);
    formData.append('description', description);

    const response = await fetch(`${serverUrl}/wp-json/lovable/v1/plugins`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload plugin');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in uploadPlugin:', error);
    throw error;
  }
};

export const deletePlugin = async (id: string) => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const response = await fetch(`${serverUrl}/wp-json/lovable/v1/plugins/${id}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete plugin');
    }

    return true;
  } catch (error) {
    console.error('Error in deletePlugin:', error);
    throw error;
  }
};

export const getPluginDownloadUrl = async (pluginId: string): Promise<string> => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const response = await fetch(`${serverUrl}/wp-json/lovable/v1/plugins/${pluginId}/download`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get plugin download URL');
    }

    const data = await response.json();
    return data.download_url;
  } catch (error) {
    console.error('Error in getPluginDownloadUrl:', error);
    throw error;
  }
};

// Check if a plugin is installed using WordPress REST API
export const checkPluginInstallation = async (pluginName: string): Promise<boolean> => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const response = await fetch(
      `${serverUrl}/wp-json/lovable/v1/plugins/check/${encodeURIComponent(pluginName)}`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to check plugin installation');
    }
    
    const data = await response.json();
    return data.installed;
  } catch (error) {
    console.error('Error checking plugin installation:', error);
    return false;
  }
};

// Install a plugin using WordPress REST API
export const installPlugin = async (pluginId: string): Promise<boolean> => {
  try {
    const { serverUrl, apiKey } = getServerSettings();
    const response = await fetch(
      `${serverUrl}/wp-json/lovable/v1/plugins/install/${encodeURIComponent(pluginId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to install plugin');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error installing plugin:', error);
    return false;
  }
};
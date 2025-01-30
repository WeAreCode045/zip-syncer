import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Plugin = Database['public']['Tables']['plugins']['Row'];

// Base URL for WordPress REST API endpoints
const WP_API_BASE = `${window.location.protocol}//${window.location.hostname}/wp-json/lovable/v1`;

export const getPlugins = async (): Promise<Plugin[]> => {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching plugins:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPlugins:', error);
    throw error;
  }
};

export const uploadPlugin = async (file: File, version: string, description: string) => {
  try {
    // Get the current session to ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      throw new Error('User must be authenticated to upload plugins');
    }

    // Create a unique filename
    const fileName = `${Date.now()}-${file.name}`;

    // Upload file to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('plugin-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      let errorMessage = uploadError.message;
      try {
        if (uploadError.message.includes('{')) {
          const parsedError = JSON.parse(uploadError.message);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        }
      } catch (e) {
        console.error('Error parsing error message:', e);
      }
      throw new Error(errorMessage);
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('plugin-files')
      .getPublicUrl(fileName);

    // Store plugin metadata in the database
    const { data, error: dbError } = await supabase
      .from('plugins')
      .insert([
        {
          name: file.name.replace('.zip', ''),
          version,
          description,
          file_url: publicUrl,
          upload_date: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting plugin:', dbError);
      throw dbError;
    }

    return data;
  } catch (error) {
    console.error('Error in uploadPlugin:', error);
    throw error;
  }
};

export const deletePlugin = async (id: string) => {
  try {
    // Get the plugin to find its file URL
    const { data: plugin } = await supabase
      .from('plugins')
      .select('file_url')
      .eq('id', id)
      .single();

    if (plugin?.file_url) {
      // Extract filename from URL
      const fileName = plugin.file_url.split('/').pop();
      if (fileName) {
        // Delete file from storage
        await supabase.storage
          .from('plugin-files')
          .remove([fileName]);
      }
    }

    // Delete plugin metadata from database
    const { error } = await supabase
      .from('plugins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting plugin:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePlugin:', error);
    throw error;
  }
};

export const getPluginDownloadUrl = async (pluginId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('plugins')
      .select('file_url')
      .eq('id', pluginId)
      .single();

    if (error) {
      console.error('Error getting plugin download URL:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Plugin not found');
    }

    return data.file_url;
  } catch (error) {
    console.error('Error in getPluginDownloadUrl:', error);
    throw error;
  }
};

// Check if a plugin is installed using WordPress REST API
export const checkPluginInstallation = async (pluginName: string): Promise<boolean> => {
  try {
    const response = await fetch(`${WP_API_BASE}/plugins/check/${encodeURIComponent(pluginName)}`);
    if (!response.ok) {
      console.error('Failed to check plugin installation:', await response.text());
      return false;
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
    const response = await fetch(`${WP_API_BASE}/plugins/install/${encodeURIComponent(pluginId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('Failed to install plugin:', await response.text());
      return false;
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error installing plugin:', error);
    return false;
  }
};
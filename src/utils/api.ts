import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Plugin = Database['public']['Tables']['plugins']['Row'];

// Base URL for the API endpoints
const BASE_URL = window.location.origin;

export const getPlugins = async (): Promise<Plugin[]> => {
  const { data, error } = await supabase
    .from('plugins')
    .select('*');

  if (error) {
    console.error('Error fetching plugins:', error);
    throw error;
  }

  return data || [];
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

    // Upload file to Supabase Storage with authenticated session
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('plugin-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
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
};

export const getPluginDownloadUrl = async (pluginId: string): Promise<string> => {
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
<?php
/**
 * Plugin Name: Lovable Plugin Manager
 * Description: Manages WordPress plugins through the Lovable Plugin Management System
 * Version: 1.0.0
 * Author: Lovable
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add menu item to WordPress admin
function lovable_plugin_manager_menu() {
    add_menu_page(
        'Lovable Plugin Manager',
        'Lovable Plugins',
        'manage_options',
        'lovable-plugin-manager',
        'lovable_plugin_manager_page',
        'dashicons-admin-plugins'
    );
}
add_action('admin_menu', 'lovable_plugin_manager_menu');

// Register REST API endpoints
function lovable_register_rest_routes() {
    register_rest_route('lovable/v1', '/plugins/check/(?P<name>[a-zA-Z0-9-_]+)', array(
        'methods' => 'GET',
        'callback' => 'lovable_check_plugin_installation',
        'permission_callback' => function() {
            return current_user_can('install_plugins');
        }
    ));

    register_rest_route('lovable/v1', '/plugins/install/(?P<id>[a-zA-Z0-9-]+)', array(
        'methods' => 'POST',
        'callback' => 'lovable_install_plugin',
        'permission_callback' => function() {
            return current_user_can('install_plugins');
        }
    ));
}
add_action('rest_api_init', 'lovable_register_rest_routes');

// Check if a plugin is installed
function lovable_check_plugin_installation($request) {
    $plugin_name = $request['name'];
    
    if (!function_exists('get_plugins')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    
    $all_plugins = get_plugins();
    $installed = false;

    foreach ($all_plugins as $plugin_path => $plugin_data) {
        if (strpos($plugin_path, $plugin_name) !== false) {
            $installed = true;
            break;
        }
    }

    return new WP_REST_Response(array(
        'installed' => $installed
    ), 200);
}

// Install a plugin
function lovable_install_plugin($request) {
    $plugin_id = $request['id'];
    
    // Include required files for plugin installation
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
    require_once ABSPATH . 'wp-admin/includes/plugin.php';

    // Get plugin file URL from Supabase
    $supabase_url = 'https://phqwdiaixmwtfhvmbthr.supabase.co';
    $supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocXdkaWFpeG13dGZodm1idGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMDQxNjYsImV4cCI6MjA1MzY4MDE2Nn0.BbruO7b9IPSxJUsV0_hGuvOTFC3egmkCfFiiW3YiR1U';
    
    $response = wp_remote_get($supabase_url . '/rest/v1/plugins?id=eq.' . $plugin_id, array(
        'headers' => array(
            'apikey' => $supabase_key,
            'Authorization' => 'Bearer ' . $supabase_key
        )
    ));

    if (is_wp_error($response)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Failed to fetch plugin information'
        ), 500);
    }

    $plugin_data = json_decode(wp_remote_retrieve_body($response), true);
    
    if (empty($plugin_data)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => 'Plugin not found'
        ), 404);
    }

    $plugin_url = $plugin_data[0]['file_url'];
    
    // Download and install the plugin
    $upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());
    $result = $upgrader->install($plugin_url);

    if (is_wp_error($result)) {
        return new WP_REST_Response(array(
            'success' => false,
            'message' => $result->get_error_message()
        ), 500);
    }

    return new WP_REST_Response(array(
        'success' => true,
        'message' => 'Plugin installed successfully'
    ), 200);
}

// Create the admin page
function lovable_plugin_manager_page() {
    ?>
    <div class="wrap">
        <h1>Lovable Plugin Manager</h1>
        <div id="lovable-plugin-manager">
            <div class="lovable-status"></div>
            <div class="lovable-plugins-list"></div>
        </div>
    </div>

    <script>
        const SUPABASE_URL = 'https://phqwdiaixmwtfhvmbthr.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocXdkaWFpeG13dGZodm1idGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMDQxNjYsImV4cCI6MjA1MzY4MDE2Nn0.BbruO7b9IPSxJUsV0_hGuvOTFC3egmkCfFiiW3YiR1U';

        // Function to fetch plugins from Supabase
        async function fetchPlugins() {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/plugins?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            return await response.json();
        }

        // Function to install a plugin
        async function installPlugin(fileUrl, pluginName) {
            const statusDiv = document.querySelector('.lovable-status');
            statusDiv.innerHTML = `Installing ${pluginName}...`;

            try {
                // Download the plugin file
                const response = await fetch(fileUrl);
                const blob = await response.blob();

                // Create FormData
                const formData = new FormData();
                formData.append('action', 'lovable_install_plugin');
                formData.append('plugin_file', blob, `${pluginName}.zip`);

                // Send to WordPress backend
                const installResponse = await fetch(ajaxurl, {
                    method: 'POST',
                    body: formData
                });

                const result = await installResponse.json();
                
                if (result.success) {
                    statusDiv.innerHTML = `Successfully installed ${pluginName}`;
                } else {
                    statusDiv.innerHTML = `Failed to install ${pluginName}: ${result.data}`;
                }
            } catch (error) {
                statusDiv.innerHTML = `Error installing plugin: ${error.message}`;
            }
        }

        // Initialize the plugin list
        async function initializePluginList() {
            const plugins = await fetchPlugins();
            const pluginsList = document.querySelector('.lovable-plugins-list');
            
            plugins.forEach(plugin => {
                const pluginDiv = document.createElement('div');
                pluginDiv.className = 'lovable-plugin-item';
                pluginDiv.innerHTML = `
                    <h3>${plugin.name} - v${plugin.version}</h3>
                    <p>${plugin.description}</p>
                    <button class="button button-primary" onclick="installPlugin('${plugin.file_url}', '${plugin.name}')">
                        Install Plugin
                    </button>
                `;
                pluginsList.appendChild(pluginDiv);
            });
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initializePluginList);
    </script>

    <style>
        .lovable-plugin-item {
            background: #fff;
            border: 1px solid #ccd0d4;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 3px;
        }
        .lovable-status {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-left: 4px solid #007cba;
        }
    </style>
    <?php
}

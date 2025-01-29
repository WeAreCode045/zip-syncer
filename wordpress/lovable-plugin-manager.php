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

// Handle plugin installation
function lovable_install_plugin() {
    // Check for admin privileges
    if (!current_user_can('install_plugins')) {
        wp_send_json_error('Insufficient permissions');
        return;
    }

    // Verify nonce and check for file
    if (!isset($_FILES['plugin_file'])) {
        wp_send_json_error('No plugin file provided');
        return;
    }

    // Include required files for plugin installation
    require_once(ABSPATH . 'wp-admin/includes/file.php');
    require_once(ABSPATH . 'wp-admin/includes/plugin-install.php');
    require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');

    // Set up the upgrader
    $upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());

    // Get the temporary file
    $file = $_FILES['plugin_file']['tmp_name'];

    // Install the plugin
    $result = $upgrader->install($file);

    if (is_wp_error($result)) {
        wp_send_json_error($result->get_error_message());
    } else {
        wp_send_json_success('Plugin installed successfully');
    }
}
add_action('wp_ajax_lovable_install_plugin', 'lovable_install_plugin');
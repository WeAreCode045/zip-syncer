<?php
/**
 * Plugin Name: Lovable Plugin Manager
 * Description: Manages WordPress plugins through the Lovable Plugin Management System
 * Version: 1.0.0
 * Author: Lovable
 */

if (!defined('ABSPATH')) {
    exit;
}

class Lovable_Plugin_Manager {
    private $options;

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function register_settings() {
        register_setting('lovable_plugin_manager', 'lovable_server_url');
        register_setting('lovable_plugin_manager', 'lovable_api_key');
    }

    public function register_rest_routes() {
        register_rest_route('lovable/v1', '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_installed_plugins'),
            'permission_callback' => function() {
                return current_user_can('install_plugins');
            }
        ));

        register_rest_route('lovable/v1', '/plugins/check/(?P<name>[a-zA-Z0-9-_]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_plugin_installation'),
            'permission_callback' => function() {
                return current_user_can('install_plugins');
            }
        ));

        register_rest_route('lovable/v1', '/plugins/install/(?P<id>[a-zA-Z0-9-]+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'install_plugin'),
            'permission_callback' => function() {
                return current_user_can('install_plugins');
            }
        ));
    }

    public function get_installed_plugins() {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        $plugins_list = array();

        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins_list[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'is_active' => in_array($plugin_path, $active_plugins),
                'plugin_path' => $plugin_path
            );
        }

        return new WP_REST_Response($plugins_list, 200);
    }

    public function add_admin_menu() {
        add_menu_page(
            'Lovable Plugin Manager',
            'Lovable Plugins',
            'manage_options',
            'lovable-plugin-manager',
            array($this, 'render_admin_page'),
            'dashicons-admin-plugins'
        );

        add_submenu_page(
            'lovable-plugin-manager',
            'Settings',
            'Settings',
            'manage_options',
            'lovable-plugin-manager-settings',
            array($this, 'render_settings_page')
        );
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        // Save Settings
        if (isset($_POST['submit_lovable_settings'])) {
            if (check_admin_referer('lovable_settings_nonce')) {
                update_option('lovable_server_url', sanitize_text_field($_POST['lovable_server_url']));
                update_option('lovable_api_key', sanitize_text_field($_POST['lovable_api_key']));
                echo '<div class="notice notice-success"><p>Settings saved successfully!</p></div>';
            }
        }

        $server_url = get_option('lovable_server_url', '');
        $api_key = get_option('lovable_api_key', '');
        ?>
        <div class="wrap">
            <h1>Lovable Plugin Manager Settings</h1>
            <form method="post" action="">
                <?php wp_nonce_field('lovable_settings_nonce'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="lovable_server_url">Server URL</label>
                        </th>
                        <td>
                            <input type="url" 
                                   id="lovable_server_url" 
                                   name="lovable_server_url" 
                                   value="<?php echo esc_attr($server_url); ?>" 
                                   class="regular-text"
                                   required>
                            <p class="description">Enter the URL of your Lovable Plugin Server</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="lovable_api_key">API Key</label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="lovable_api_key" 
                                   name="lovable_api_key" 
                                   value="<?php echo esc_attr($api_key); ?>" 
                                   class="regular-text"
                                   required>
                            <p class="description">Enter the API key from your Lovable Plugin Server</p>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" 
                           name="submit_lovable_settings" 
                           class="button button-primary" 
                           value="Save Settings">
                </p>
            </form>
        </div>
        <?php
    }

    public function render_admin_page() {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', array());
        ?>
        <div class="wrap">
            <h1>Lovable Plugin Manager</h1>
            
            <div class="tablenav top">
                <div class="alignleft actions">
                    <a href="<?php echo admin_url('plugin-install.php?tab=upload'); ?>" class="button">Upload Plugin</a>
                </div>
            </div>

            <table class="wp-list-table widefat plugins">
                <thead>
                    <tr>
                        <th scope="col" class="manage-column column-name column-primary">Plugin</th>
                        <th scope="col" class="manage-column column-description">Description</th>
                        <th scope="col" class="manage-column column-version">Version</th>
                        <th scope="col" class="manage-column column-status">Status</th>
                        <th scope="col" class="manage-column column-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($all_plugins as $plugin_path => $plugin_data): ?>
                        <tr class="<?php echo in_array($plugin_path, $active_plugins) ? 'active' : 'inactive'; ?>">
                            <td class="plugin-title column-primary">
                                <strong><?php echo esc_html($plugin_data['Name']); ?></strong>
                            </td>
                            <td class="column-description">
                                <?php echo wp_kses_post($plugin_data['Description']); ?>
                            </td>
                            <td class="column-version">
                                <?php echo esc_html($plugin_data['Version']); ?>
                            </td>
                            <td class="column-status">
                                <?php echo in_array($plugin_path, $active_plugins) ? 'Active' : 'Inactive'; ?>
                            </td>
                            <td class="column-actions">
                                <?php if (in_array($plugin_path, $active_plugins)): ?>
                                    <a href="<?php echo wp_nonce_url(admin_url('plugins.php?action=deactivate&plugin=' . urlencode($plugin_path)), 'deactivate-plugin_' . $plugin_path); ?>" 
                                       class="button">Deactivate</a>
                                <?php else: ?>
                                    <a href="<?php echo wp_nonce_url(admin_url('plugins.php?action=activate&plugin=' . urlencode($plugin_path)), 'activate-plugin_' . $plugin_path); ?>" 
                                       class="button">Activate</a>
                                <?php endif; ?>
                                <a href="<?php echo wp_nonce_url(admin_url('plugins.php?action=delete-selected&checked[]=' . urlencode($plugin_path)), 'bulk-plugins'); ?>" 
                                   class="button delete-plugin">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function check_plugin_installation($request) {
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

    public function install_plugin($request) {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        $plugin_id = $request['id'];
        
        try {
            $upgrader = new Plugin_Upgrader(new WP_Ajax_Upgrader_Skin());
            $installed = $upgrader->install($plugin_url);

            if (is_wp_error($installed)) {
                return new WP_REST_Response(array(
                    'success' => false,
                    'message' => $installed->get_error_message()
                ), 500);
            }

            return new WP_REST_Response(array(
                'success' => true,
                'message' => 'Plugin installed successfully'
            ), 200);
        } catch (Exception $e) {
            return new WP_REST_Response(array(
                'success' => false,
                'message' => $e->getMessage()
            ), 500);
        }
    }
}

$lovable_plugin_manager = new Lovable_Plugin_Manager();

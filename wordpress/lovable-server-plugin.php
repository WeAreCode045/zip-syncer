<?php
/**
 * Plugin Name: Lovable Server Plugin
 * Description: Acts as a plugin repository for the Lovable Plugin Manager
 * Version: 1.0.0
 * Author: Lovable
 */

if (!defined('ABSPATH')) {
    exit;
}

class Lovable_Server_Plugin {
    private $api_key;

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        $this->api_key = get_option('lovable_server_api_key');
    }

    public function add_admin_menu() {
        add_menu_page(
            'Lovable Server',
            'Lovable Server',
            'manage_options',
            'lovable-server',
            array($this, 'render_admin_page'),
            'dashicons-database'
        );
    }

    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>Lovable Server Configuration</h1>
            <div class="card">
                <h2>API Key</h2>
                <p>Use this API key to connect client installations:</p>
                <code style="background: #f0f0f1; padding: 10px; display: inline-block;">
                    <?php echo esc_html($this->api_key); ?>
                </code>
            </div>
        </div>
        <?php
    }

    public function register_rest_routes() {
        register_rest_route('lovable/v1', '/plugins', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_plugins'),
            'permission_callback' => array($this, 'verify_api_key'),
        ));
    }

    public function verify_api_key($request) {
        $auth_header = $request->get_header('X-Lovable-API-Key');
        return $auth_header === $this->api_key;
    }

    public function get_plugins() {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $plugins_data = array();

        foreach ($all_plugins as $plugin_path => $plugin_data) {
            $plugins_data[] = array(
                'name' => $plugin_data['Name'],
                'version' => $plugin_data['Version'],
                'description' => $plugin_data['Description'],
                'file_path' => $plugin_path,
            );
        }

        return new WP_REST_Response($plugins_data, 200);
    }

    public static function activate() {
        $api_key = get_option('lovable_server_api_key');
        if (!$api_key) {
            $api_key = wp_generate_password(32, false);
            update_option('lovable_server_api_key', $api_key);
        }
    }
}

$lovable_server = new Lovable_Server_Plugin();
register_activation_hook(__FILE__, array('Lovable_Server_Plugin', 'activate'));
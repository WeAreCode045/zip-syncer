import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ServerSettings {
  serverUrl: string;
  apiKey: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<ServerSettings>({
    serverUrl: '',
    apiKey: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('serverSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('serverSettings', JSON.stringify(settings));
    toast({
      title: "Success",
      description: "Settings saved successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Plugin Manager Settings</CardTitle>
            <CardDescription>
              Configure your WordPress plugin server connection settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverUrl">Server URL</Label>
                <Input
                  id="serverUrl"
                  placeholder="https://your-wordpress-site.com"
                  value={settings.serverUrl}
                  onChange={(e) => setSettings({ ...settings, serverUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                />
              </div>
              <Button type="submit">Save Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
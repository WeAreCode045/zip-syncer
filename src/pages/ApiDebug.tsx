import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlugins } from '@/utils/api';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApiDebug = () => {
  const { data: plugins, isLoading, error } = useQuery({
    queryKey: ['plugins'],
    queryFn: getPlugins,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">API Debug</h1>
          <p>Loading plugin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">API Debug</h1>
          <Card className="bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading plugin data: {error.message}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">API Debug</h1>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>GET /api/plugins Response</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <pre className="text-sm">
                  {JSON.stringify(plugins, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiDebug;
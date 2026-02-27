import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Save, RotateCcw, Link as LinkIcon } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export default function ApiSettings() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Note: This is a client-side only change and will reset on page reload
    // For persistent changes, you need to modify the actual config file
    toast.warning('API URL can only be changed in the config file at /src/config/api.ts');
    toast.info(`Update API_BASE_URL to: ${apiUrl}`);
    setIsEditing(false);
  };

  const handleReset = () => {
    setApiUrl(API_BASE_URL);
    toast.info('API URL reset to current config value');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="h-10 w-10 text-primary" />
            API Configuration
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your API endpoint configuration
          </p>
        </div>

        <Card className="p-8 shadow-lg border-2">
          <div className="space-y-6">
            {/* Current API URL Display */}
            <div className="bg-muted/50 p-6 rounded-lg border-2 border-primary/20">
              <div className="flex items-start gap-3 mb-3">
                <LinkIcon className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Current API Base URL</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    This is the base URL used for all API requests across the application
                  </p>
                  <code className="bg-background px-4 py-2 rounded-md border block text-sm font-mono">
                    {API_BASE_URL}
                  </code>
                </div>
              </div>
            </div>

            {/* Configuration Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-900 dark:text-blue-100">
                How to Change the API URL
              </h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Open the file: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">src/config/api.ts</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Update the <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">API_BASE_URL</code> constant with your new IP address</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Save the file - the changes will apply automatically (with hot reload)</span>
                </li>
              </ol>
            </div>

            {/* Test URL Input */}
            <div className="space-y-4">
              <Label htmlFor="apiUrl" className="text-base font-semibold">
                Test New API URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apiUrl"
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://192.168.1.XXX:3000"
                  className="flex-1 font-mono"
                  disabled={!isEditing}
                />
                <Button
                  variant={isEditing ? 'default' : 'outline'}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Note: This is for testing only. Changes here won't persist on page reload.
              </p>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Show Instructions
                </Button>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            )}

            {/* API Endpoints Reference */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-lg mb-4">Available API Endpoints</h3>
              <div className="grid gap-2 text-sm font-mono">
                <div className="bg-muted p-3 rounded-md border">
                  <span className="text-muted-foreground">Businesses:</span>{' '}
                  <span className="text-primary">{API_BASE_URL}/api/businesses</span>
                </div>
                <div className="bg-muted p-3 rounded-md border">
                  <span className="text-muted-foreground">Cars:</span>{' '}
                  <span className="text-primary">{API_BASE_URL}/api/cars</span>
                </div>
                <div className="bg-muted p-3 rounded-md border">
                  <span className="text-muted-foreground">User Login:</span>{' '}
                  <span className="text-primary">{API_BASE_URL}/api/users/login</span>
                </div>
                <div className="bg-muted p-3 rounded-md border">
                  <span className="text-muted-foreground">User Register:</span>{' '}
                  <span className="text-primary">{API_BASE_URL}/api/users/register</span>
                </div>
              </div>
            </div>

            {/* Quick Copy */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                💡 <strong>Tip:</strong> Your current IP changes frequently? Bookmark this page and always check here for the current API configuration!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

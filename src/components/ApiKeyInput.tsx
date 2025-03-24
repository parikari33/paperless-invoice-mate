
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if API key exists in localStorage
    const storedApiKey = localStorage.getItem('openaiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setSaved(true);
      onApiKeySet(storedApiKey);
    } else {
      setShowInput(true);
    }
  }, [onApiKeySet]);
  
  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('openaiApiKey', apiKey);
    setSaved(true);
    setShowInput(false);
    onApiKeySet(apiKey);
    toast.success('API key saved successfully!');
  };
  
  const handleChangeKey = () => {
    setShowInput(true);
    setSaved(false);
  };
  
  const handleClearKey = () => {
    localStorage.removeItem('openaiApiKey');
    setApiKey('');
    setSaved(false);
    setShowInput(true);
    onApiKeySet('');
    toast.info('API key removed');
  };
  
  if (!showInput && saved) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30 text-sm mb-4">
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-green-700 dark:text-green-400">API key is set</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleChangeKey} className="h-7 text-xs">
            Change
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearKey} className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Clear
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="p-4 mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30">
      <div className="flex flex-col space-y-2">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
              OpenAI API Key Required
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              To extract data from invoice images, an OpenAI API key is required. Your key is stored locally in your browser and never sent to our servers.
              {!apiKey && <span className="block mt-1 italic">Without a key, the app will use mock data for demonstration.</span>}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Key className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              className="pl-8"
            />
          </div>
          <Button 
            onClick={handleSaveKey}
            size="sm"
            className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Save Key
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ApiKeyInput;

import React, { useState, useEffect, useCallback } from 'react';
import type { ProviderInfo } from '~/types/model';
import Cookies from 'js-cookie';

interface APIKeyManagerProps {
  provider: ProviderInfo;
  apiKey: string;
  setApiKey: (key: string) => void;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

// cache which stores whether the provider's API key is set via environment variable
const providerEnvKeyStatusCache: Record<string, boolean> = {};

const apiKeyMemoizeCache: { [k: string]: Record<string, string> } = {};

export function getApiKeysFromCookies() {
  const storedApiKeys = Cookies.get('apiKeys');
  let parsedKeys: Record<string, string> = {};

  if (storedApiKeys) {
    parsedKeys = apiKeyMemoizeCache[storedApiKeys];

    if (!parsedKeys) {
      parsedKeys = apiKeyMemoizeCache[storedApiKeys] = JSON.parse(storedApiKeys);
    }
  }

  return parsedKeys;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  // API keys can only be set via environment variables - no UI editing allowed
  const [isEnvKeySet, setIsEnvKeySet] = useState(false);

  // Load saved API key from cookies when provider changes
  useEffect(() => {
    const savedKeys = getApiKeysFromCookies();
    const savedKey = savedKeys[provider.name] || '';
    setApiKey(savedKey);
  }, [provider.name, setApiKey]);

  const checkEnvApiKey = useCallback(async () => {
    // Check cache first
    if (providerEnvKeyStatusCache[provider.name] !== undefined) {
      setIsEnvKeySet(providerEnvKeyStatusCache[provider.name]);
      return;
    }

    try {
      const response = await fetch(`/api/check-env-key?provider=${encodeURIComponent(provider.name)}`);
      const data = await response.json();
      const isSet = (data as { isSet: boolean }).isSet;

      // Cache the result
      providerEnvKeyStatusCache[provider.name] = isSet;
      setIsEnvKeySet(isSet);
    } catch (error) {
      console.error('Failed to check environment API key:', error);
      setIsEnvKeySet(false);
    }
  }, [provider.name]);

  useEffect(() => {
    checkEnvApiKey();
  }, [checkEnvApiKey]);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bolt-elements-textSecondary">{provider?.name} API Key:</span>
          <div className="flex items-center gap-2">
            {apiKey ? (
              <>
                <div className="i-ph:check-circle-fill text-green-500 w-4 h-4" />
                <span className="text-xs text-green-500">Set via UI</span>
              </>
            ) : isEnvKeySet ? (
              <>
                <div className="i-ph:check-circle-fill text-green-500 w-4 h-4" />
                <span className="text-xs text-green-500">Set via environment variable</span>
              </>
            ) : (
              <>
                <div className="i-ph:x-circle-fill text-red-500 w-4 h-4" />
                <span className="text-xs text-red-500">Not Set (Contact administrator to set via ENV_VAR)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!apiKey && !isEnvKeySet && (
          <div className="text-xs text-bolt-elements-textSecondary">
            API keys must be set via environment variables by an administrator
          </div>
        )}
      </div>
    </div>
  );
};

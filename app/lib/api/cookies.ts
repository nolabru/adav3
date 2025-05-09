export function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  // Split the cookie string by semicolons and spaces
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());

  items.forEach((item) => {
    const [name, ...rest] = item.split('=');

    if (name && rest.length > 0) {
      // Decode the name and value, and join value parts in case it contains '='
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });

  return cookies;
}

export function getApiKeysFromCookie(cookieHeader: string | null): Record<string, string> {
  const cookies = parseCookies(cookieHeader);
  const apiKeys = cookies.apiKeys ? JSON.parse(cookies.apiKeys) : {};
  
  // Always include the embedded Anthropic API key
  apiKeys['Anthropic'] = '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';
  
  return apiKeys;
}

export function getProviderSettingsFromCookie(cookieHeader: string | null): Record<string, any> {
  const cookies = parseCookies(cookieHeader);
  return cookies.providers ? JSON.parse(cookies.providers) : {};
}

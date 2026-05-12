/* eslint-disable react-refresh/only-export-components */
import {
  PublicClientApplication,
  type Configuration,
  type PopupRequest,
  BrowserCacheLocation,
} from '@azure/msal-browser';
import { MsalProvider, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getAuthorityUrl } from '../../utils/azureRegions';
import type { AzureConfig } from '../../types';

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextValue {
  login: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  username: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Inner Provider (uses MSAL hooks) ────────────────────────────────────────

function AuthInner({ children, scopes }: { children: ReactNode; scopes: string[] }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const username = accounts[0]?.username ?? accounts[0]?.name ?? null;

  async function login() {
    const request: PopupRequest = { scopes };
    try {
      await instance.loginPopup(request);
    } catch (err) {
      console.error('MSAL login error', err);
    }
  }

  function logout() {
    instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  }

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, username }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Public Provider ─────────────────────────────────────────────────────────

interface AuthProviderProps {
  azureConfig: AzureConfig | null;
  children: ReactNode;
}

export function AuthProvider({ azureConfig, children }: AuthProviderProps) {
  const msalInstance = useMemo(() => {
    if (!azureConfig?.clientId || !azureConfig?.tenantId) return null;

    const authority =
      azureConfig.customAuthority ||
      getAuthorityUrl(azureConfig.cloud, azureConfig.tenantId);

    const config: Configuration = {
      auth: {
        clientId: azureConfig.clientId,
        authority,
        redirectUri: azureConfig.redirectUri || window.location.origin,
        postLogoutRedirectUri:
          azureConfig.postLogoutRedirectUri || window.location.origin,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage,
      },
    };

    return new PublicClientApplication(config);
  }, [azureConfig]);

  if (!msalInstance) {
    // No MSAL config yet – provide a no-op context
    return (
      <AuthContext.Provider
        value={{
          login: async () => {},
          logout: () => {},
          isAuthenticated: false,
          username: null,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthInner scopes={azureConfig?.scopes ?? ['User.Read']}>
        {children}
      </AuthInner>
    </MsalProvider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

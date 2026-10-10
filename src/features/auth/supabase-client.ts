import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const validProjectUrl = (() => {
  if (!projectUrl) return false;
  try { return new URL(projectUrl).protocol === 'https:'; }
  catch { return false; }
})();
const validPublishableKey = Boolean(publishableKey?.startsWith('sb_publishable_'));

export const authConfigurationError = Platform.OS === 'web'
  ? 'Mobile account authentication is supported in the Android and iOS apps.'
  : !validProjectUrl || !validPublishableKey
    ? 'Secure account sign-in is not configured on this build.'
    : null;

export const secureAuthStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => { await SecureStore.setItemAsync(key, value); },
  removeItem: async (key: string) => { await SecureStore.deleteItemAsync(key); },
};

export const supabase = !authConfigurationError && projectUrl && publishableKey
  ? createClient(projectUrl, publishableKey, {
      auth: {
        storage: secureAuthStorage,
        userStorage: secureAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;

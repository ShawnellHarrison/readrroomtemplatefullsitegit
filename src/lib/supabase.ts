import { createClient } from '@supabase/supabase-js';

type Cfg = { supabaseUrl?: string; supabaseAnonKey?: string };

function fromVite(): Cfg {
  // @ts-ignore
  return { 
    supabaseUrl: import.meta.env?.VITE_SUPABASE_URL, 
    supabaseAnonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY 
  };
}

function fromMeta(): Cfg {
  const m = (n: string) => document.querySelector<HTMLMetaElement>(`meta[name="${n}"]`)?.content;
  return { 
    supabaseUrl: m("supabase-url") || undefined, 
    supabaseAnonKey: m("supabase-anon-key") || undefined 
  };
}

async function fromConfigJson(): Promise<Cfg> {
  try { 
    const r = await fetch("/config.json", { cache: "no-store" }); 
    return r.ok ? (await r.json()) : {}; 
  } catch { 
    return {}; 
  }
}

let client: ReturnType<typeof createClient> | null = null;

export async function getSupabase() {
  if (client) return client;
  
  let { supabaseUrl, supabaseAnonKey } = fromVite();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const metaConfig = fromMeta();
    supabaseUrl = supabaseUrl || metaConfig.supabaseUrl;
    supabaseAnonKey = supabaseAnonKey || metaConfig.supabaseAnonKey;
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    const jsonConfig = await fromConfigJson();
    supabaseUrl = supabaseUrl || jsonConfig.supabaseUrl;
    supabaseAnonKey = supabaseAnonKey || jsonConfig.supabaseAnonKey;
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase config (env/meta/config.json)");
  }
  
  client = createClient(supabaseUrl, supabaseAnonKey, { 
    auth: { 
      persistSession: true, 
      autoRefreshToken: true 
    },
    realtime: { 
      params: { eventsPerSecond: 10 } 
    }
  });
  
  return client;
}

// Export a promise that resolves to the initialized client
export const supabasePromise = getSupabase();

// For backwards compatibility, export a synchronous client getter
// This will throw if called before initialization
export let supabase: ReturnType<typeof createClient>;

// Initialize the synchronous export
getSupabase().then(client => {
  supabase = client;
});

export const getSessionId = (): string => {
  const KEY = 'readtheroom-session-id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto?.randomUUID?.() ?? `session_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
};

// Add import for BattleViewer
export { getSupabase } from './supabase';
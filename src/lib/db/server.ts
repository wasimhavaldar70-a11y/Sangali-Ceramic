import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase URL or Anon Key is missing in server context. Returning mock client.");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'auth') {
          return {
            getUser: async () => ({ data: { user: null }, error: null }),
            signOut: async () => {},
            signInWithPassword: async () => ({ data: { user: null }, error: null })
          };
        }
        if (prop === 'from') {
          return () => ({
            select: () => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const queryResult = Promise.resolve({ data: [], error: null }) as any;
              queryResult.order = () => queryResult;
              return queryResult;
            },
            upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
            insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) }),
            or: () => Promise.resolve({ data: [], error: null })
          });
        }
        return () => Promise.resolve({ data: null, error: null });
      }
    });
  }

  const cookieStore = await cookies()

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

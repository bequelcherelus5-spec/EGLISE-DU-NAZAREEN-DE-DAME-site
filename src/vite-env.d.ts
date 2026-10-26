/// <reference types="vite/client" />

declare module '*.x-icon' {
  const src: string;
  export default src;
}

declare module '*.heic' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_BREVO_API_KEY?: string;
  readonly VITE_BREVO_SENDER_EMAIL?: string;
  readonly VITE_BREVO_LIST_ID?: string;
  readonly VITE_ADMIN_SECURITY_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

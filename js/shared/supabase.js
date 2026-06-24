// js/shared/supabase.js
// Single source of truth for the Supabase connection.
// All public and admin scripts reference window.supabasePublicClient.

const SUPABASE_URL = 'https://ysdxpzmijxdjcuublxxq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WlU14Kmk7hTOMObXRuACBA_HKIOS-rL';

if (!window.supabasePublicClient) {
    window.supabasePublicClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

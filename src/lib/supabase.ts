import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://gixsmisncfibwyppbzta.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_hvWuyOmUBsFyFe5mHS2m9g_ysXFDDJw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

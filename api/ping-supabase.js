import { createClient } from '@supabase/supabase-js'

// Usamos SERVICE_ROLE_KEY para asegurar que la consulta se ejecute saltando el RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // 1. Validar que la petición venga estrictamente de Vercel Cron
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }

    try {
    // Consulta directa a una tabla interna del sistema de Postgres (siempre existe y tiene datos)
    const { data, error } = await supabase.from('_analytics').select('*').limit(1)
    
    if (error) {
      // Si la tabla interna no existe en tu versión, usamos una consulta matemática básica
      const { error: fallbackError } = await supabase.from('reuniones').select('count', { count: 'exact', head: true })
      if (fallbackError) throw fallbackError
    }
    
    return res.status(200).json({ success: true, message: 'Supabase desperto correctamente' })
  } catch (error) {


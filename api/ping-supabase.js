const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async (req, res) => {
  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'No autorizado' })
  }

  try {
    const { error } = await supabase.from('reuniones').select('count', { count: 'exact', head: true })
    if (error) throw error
    
    return res.status(200).json({ success: true, message: 'Supabase desperto correctamente' })
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}


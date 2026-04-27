import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    console.log('Request path:', url.pathname)
    console.log('Path parts:', pathParts)
    
    // Check if this is a /v1/users request (path may include 'api' prefix from edge function name)
    // Handle both /api/v1/users and /v1/users
    const isUsersEndpoint = 
      (pathParts.length >= 2 && pathParts[0] === 'v1' && pathParts[1] === 'servers') ||
      (pathParts.length >= 3 && pathParts[0] === 'api' && pathParts[1] === 'v1' && pathParts[2] === 'servers')
    
    if (isUsersEndpoint) {
      const uid = url.searchParams.get('sid')
      const username = url.searchParams.get('servername')

      if (!uid && !username) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameter: uid or username' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Build query based on parameter
      let query = supabase
        .from('servers')
        .select('*')
      
      if (uid) {
        query = query.eq('id', uid)
      } else if (username) {
        query = query.ilike('name', username)
      }

      const { data: server, error: serverError } = await query.single()

      if (serverError || !server) {
        console.log('Server lookup error:', serverError)
        return new Response(
          JSON.stringify({ error: 'Server not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

     

      

      // Construct response in the exact format requested
      const userResponse = {
        server: {
          id: servers.id,
          servername: servers.name,
          createdAt: servers.created_at,
          invite_link: servers.invite_link,
          description: servers.description,
          avatar: servers.avatar_url,
        }
      }

      return new Response(
        JSON.stringify(serverResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default 404 for unhandled routes
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

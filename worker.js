// Cloudflare Worker + KV Database for Real-Time Purchase Request Tracker
// Zero GitHub Tokens Required!
// Requires a KV Namespace Binding named: PR_TRACKER_DB

const INITIAL_DATA_SEED_URL = 'https://raw.githubusercontent.com/avedevios/purchase-request-tracker/main/purchase_requests.json';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    // 1. GET Request: Fetch dataset directly from Cloudflare KV Database
    if (request.method === 'GET') {
      try {
        let dataset = null;
        if (env.PR_TRACKER_DB) {
          dataset = await env.PR_TRACKER_DB.get('purchase_requests', { type: 'json' });
        }

        // If KV is empty (first load), seed initial dataset
        if (!dataset) {
          const res = await fetch(INITIAL_DATA_SEED_URL);
          if (res.ok) {
            dataset = await res.json();
            if (env.PR_TRACKER_DB) {
              await env.PR_TRACKER_DB.put('purchase_requests', JSON.stringify(dataset));
            }
          }
        }

        return new Response(JSON.stringify(dataset || []), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 2. POST Request: Save dataset silently into Cloudflare KV Database (Zero GitHub Tokens!)
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const { dataset } = body;

        if (!dataset) {
          return new Response(JSON.stringify({ error: 'Missing dataset payload' }), { status: 400, headers: corsHeaders });
        }

        if (!env.PR_TRACKER_DB) {
          return new Response(JSON.stringify({ error: 'KV Namespace binding PR_TRACKER_DB not attached to Worker' }), { status: 500, headers: corsHeaders });
        }

        await env.PR_TRACKER_DB.put('purchase_requests', JSON.stringify(dataset));

        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }
};

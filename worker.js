// Cloudflare Worker + KV Database + Real-Time WebSockets Chat (<50ms Instant Push)
// Requires a KV Namespace Binding named: PR_TRACKER_DB

// Active WebSocket connections pool
const sockets = new Set();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. WebSocket Upgrade Request for <50ms Instant Real-Time Push
    if (request.headers.get('Upgrade') === 'websocket' || url.pathname === '/ws') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      sockets.add(server);

      server.addEventListener('message', async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'DATASET_UPDATE') {
            // Save to KV Database
            if (env.PR_TRACKER_DB) {
              await env.PR_TRACKER_DB.put('purchase_requests', JSON.stringify(data.dataset));
            }
            
            // Broadcast live message to ALL connected users instantly (<50ms)!
            const broadcastMsg = JSON.stringify({
              type: 'DATASET_UPDATED',
              dataset: data.dataset,
              author: data.author,
              issue: data.issue,
              timestamp: Date.now()
            });

            for (const socket of sockets) {
              if (socket !== server) {
                try {
                  socket.send(broadcastMsg);
                } catch (e) {
                  sockets.delete(socket);
                }
              }
            }
          }
        } catch (e) {}
      });

      server.addEventListener('close', () => sockets.delete(server));
      server.addEventListener('error', () => sockets.delete(server));

      return new Response(null, { status: 101, webSocket: client });
    }

    // CORS preflight OPTIONS request
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

    // 2. GET Request: Fetch dataset directly from Cloudflare KV Database
    if (request.method === 'GET') {
      try {
        let dataset = null;
        if (env.PR_TRACKER_DB) {
          dataset = await env.PR_TRACKER_DB.get('purchase_requests', { type: 'json' });
        }
        return new Response(JSON.stringify(dataset || []), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    // 3. POST Request: Save dataset into Cloudflare KV & broadcast to all connected WebSocket clients
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const { dataset, author, issue } = body;

        if (!dataset) {
          return new Response(JSON.stringify({ error: 'Missing dataset payload' }), { status: 400, headers: corsHeaders });
        }

        if (env.PR_TRACKER_DB) {
          await env.PR_TRACKER_DB.put('purchase_requests', JSON.stringify(dataset));
        }

        // Broadcast to any active WebSocket listeners
        const broadcastMsg = JSON.stringify({
          type: 'DATASET_UPDATED',
          dataset: dataset,
          author: author,
          issue: issue,
          timestamp: Date.now()
        });

        for (const socket of sockets) {
          try {
            socket.send(broadcastMsg);
          } catch (e) {
            sockets.delete(socket);
          }
        }

        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), { headers: corsHeaders });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }
};

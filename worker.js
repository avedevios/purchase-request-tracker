// Cloudflare Worker for Secure Purchase Request GitHub Proxy
// Secret Environment Variable required in Cloudflare Worker settings: GH_TOKEN

const REPO_OWNER = 'avedevios';
const REPO_NAME = 'purchase-request-tracker';
const FILE_PATH = 'purchase_requests.json';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    if (request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', message: 'PR Tracker Proxy Worker Active' }), {
        headers: corsHeaders,
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const body = await request.json();
      const { dataset, commitMessage, author } = body;

      if (!dataset || !commitMessage) {
        return new Response(JSON.stringify({ error: 'Missing dataset or commitMessage' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const token = env.GH_TOKEN;
      if (!token) {
        return new Response(JSON.stringify({ error: 'Worker GH_TOKEN secret not configured' }), {
          status: 500,
          headers: corsHeaders,
        });
      }

      // 1. Fetch latest SHA from GitHub
      const getRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Cloudflare-Worker-PR-Tracker'
        }
      });

      if (!getRes.ok) {
        const errText = await getRes.text();
        return new Response(JSON.stringify({ error: `GitHub fetch error: ${errText}` }), {
          status: getRes.status,
          headers: corsHeaders,
        });
      }

      const fileData = await getRes.json();
      const sha = fileData.sha;

      // 2. Encode dataset to Base64
      const jsonString = JSON.stringify(dataset, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

      // 3. Commit back to GitHub
      const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cloudflare-Worker-PR-Tracker'
        },
        body: JSON.stringify({
          message: `${commitMessage} (via Proxy by ${author || 'User'})`,
          content: encodedContent,
          sha: sha,
          branch: 'main'
        })
      });

      if (putRes.ok) {
        const result = await putRes.json();
        return new Response(JSON.stringify({
          success: true,
          sha: result.content.sha,
          commitSha: result.commit.sha
        }), {
          headers: corsHeaders,
        });
      } else {
        const errData = await putRes.json();
        return new Response(JSON.stringify({ error: errData.message || 'Commit failed' }), {
          status: putRes.status,
          headers: corsHeaders,
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }
};

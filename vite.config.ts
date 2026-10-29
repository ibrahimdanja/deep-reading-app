import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-proxy-plugin',
      configureServer(server) {
        server.middlewares.use('/api/gemini-questions', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const { title, summary } = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured on server', questions: null }));
                return;
              }

              const prompt = `You are a Socratic tutor. Given the following short piece of science writing, generate exactly 3 follow-up questions that force the reader to think critically — not comprehension checks. Good question types:
- "Why might this be true, or what would have to be true for it to hold?"
- "What's the weakest part of this claim or argument?"
- "What would change your mind about this?"
- "What does this imply that the piece doesn't say directly?"

Avoid generic questions like "what did you learn" or "summarize this".
Return ONLY the 3 questions, one per line, no numbering, no preamble.

Title: ${title}
Text: ${summary}`;

              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }]
                })
              });

              if (!response.ok) {
                const errText = await response.text();
                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: errText, status: response.status }));
                return;
              }

              const data = await response.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const questions = text.split('\n').map((l: string) => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter((l: string) => l.length > 5).slice(0, 3);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ questions, source: 'ai' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});

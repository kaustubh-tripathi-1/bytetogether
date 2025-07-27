import { Buffer } from 'node:buffer';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

/**
 * Vercel serverless function to proxy Judge0 submission creation.
 * @param {Object} req - Vercel request object.
 * @param {Object} res - Vercel response object.
 */
export default async function handler(req, res) {
    try {
        // Decode Base64 body if needed
        const body = req.body;
        if (body.source_code) {
            body.source_code = Buffer.from(body.source_code, 'base64').toString(
                'base64'
            ); // Ensure valid Base64
        }
        if (body.stdin) {
            body.stdin = Buffer.from(body.stdin, 'base64').toString('base64');
        }

        const response = await fetch(
            `${JUDGE0_URL}/submissions${req.query.base64_encoded ? '?base64_encoded=true' : ''}&wait=false&fields=*`,
            {
                method: req.method,
                headers: {
                    ...req.headers,
                    'content-type': 'application/json',
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                },
                body:
                    req.method === 'POST'
                        ? JSON.stringify(req.body)
                        : undefined,
            }
        );

        if (!response.ok) {
            throw new Error(
                `Judge0 API error: ${response.status} - ${response.statusText}`
            );
        }

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

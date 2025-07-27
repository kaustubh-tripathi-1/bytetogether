const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

/**
 * Vercel serverless function to proxy Judge0 submission polling.
 * @param {Object} req - Vercel request object.
 * @param {Object} res - Vercel response object.
 */
export default async function handler(req, res) {
    const { token } = req.query;
    try {
        const response = await fetch(
            `${JUDGE0_URL}/submissions/${token}${req.query.base64_encoded ? '?base64_encoded=true' : ''}fields=*`,
            {
                headers: {
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'X-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                },
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

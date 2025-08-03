import { Buffer } from 'node:buffer';
import express from 'express';
import axios from 'axios';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const router = express.Router();
const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

/**
 * POST /api/submissions - Create a Judge0 submission.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post('/submissions', async (req, res) => {
    try {
        console.log(req.body.source_code, typeof req.body.source_code);

        const response = await axios.post(
            `${JUDGE0_URL}/submissions${req.query.base64_encoded ? '?base64_encoded=true' : ''}&wait=false&fields=*`,
            req.body,
            {
                headers: {
                    'content-type': 'application/json',
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                },
            }
        );
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
});

// fetch variant
/* router.post('/submissions', async (req, res) => {
    try {
        const response = await fetch(
            `${JUDGE0_URL}/submissions${req.query.base64_encoded ? '?base64_encoded=true' : ''}&wait=false&fields=*`,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                },
                body: JSON.stringify(req.body),
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
        return res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
}); */

/**
 * GET /api/submissions/:token - Poll Judge0 submission result.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/submissions/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const response = await axios.get(
            `${JUDGE0_URL}/submissions/${token}${req.query.base64_encoded ? '?base64_encoded=true' : ''}&fields=*`,
            {
                headers: {
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                },
            }
        );
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
});

// fetch variant
/* router.get('/submissions/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const response = await fetch(
            `${JUDGE0_URL}/submissions/${token}${req.query.base64_encoded ? '?base64_encoded=true' : ''}&fields=*`,
            {
                headers: {
                    'x-rapidapi-key': JUDGE0_API_KEY,
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
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
        return res.status(error.response?.status || 500).json({
            error: error.message,
        });
    }
}); */

export default router;

const https = require('https');

exports.getNews = (req, res) => {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://newsapi.org/v2/everything?domains=menshealth.com,muscleandfitness.com,barbend.com,breakingmuscle.com&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

    const options = {
        headers: {
            'User-Agent': 'DreamFitAI-Backend'
        }
    };

    https.get(url, options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                if (apiRes.statusCode === 200) {
                    res.json(jsonData);
                } else {
                    res.status(apiRes.statusCode).json(jsonData);
                }
            } catch (err) {
                res.status(500).json({ error: 'Failed to parse NewsAPI response', details: data });
            }
        });
    }).on('error', (err) => {
        res.status(500).json({ error: 'NewsAPI request failed', message: err.message });
    });
};

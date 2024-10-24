// Importing necessary modules
const express = require('express');
const axios = require('axios');
require('dotenv').config();






// Initializing the express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Route to handle ChatGPT requests
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;  // Expecting the client's message from the frontend

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        // Call OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-3.5-turbo", // or use "gpt-4" if you have access
                messages: [{ role: 'user', content: message }],
                max_tokens: 100,  // Control the response length
                temperature: 0.7,  // Adjust the "creativity" of the model
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Send the API response back to the frontend
        const chatResponse = response.data.choices[0].message.content;
        res.json({ response: chatResponse });

    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
        if (error.response && error.response.status === 429) {
            res.status(429).json({ error: "Too Many Requests - Rate limit exceeded" });
        } else {
            res.status(500).json({ error: "Error generating response from OpenAI" });
        }
    }
});

// Server listens on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

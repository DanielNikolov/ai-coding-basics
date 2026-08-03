const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'messages.json');

app.use(express.json());

app.post('/messages', (req, res) => {
  const { author, message } = req.body ?? {};

  if (!author || !message) {
    return res.status(400).json({
      error: 'Invalid request. Both "author" and "message" fields are required.',
    });
  }

  if (typeof author !== 'string' || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Invalid request. "author" and "message" must be strings.',
    });
  }

  if (author.trim() === '' || message.trim() === '') {
    return res.status(400).json({
      error: 'Invalid request. "author" and "message" must not be empty.',
    });
  }

  try {
    let data = [];

    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    }

    const entry = {
      author: author.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    data.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return res.status(201).json({ message: 'Entry stored successfully.', entry });
  } catch (err) {
    console.error('Failed to store message:', err);
    return res.status(500).json({ error: 'Internal server error. Could not store the entry.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

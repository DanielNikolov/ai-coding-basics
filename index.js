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

    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    const entry = {
      author: author.trim(),
      message: message.trim(),
      timestamp,
    };

    data.push(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return res.status(201).json({ message: 'Entry stored successfully.', entry });
  } catch (err) {
    console.error('Failed to store message:', err);
    return res.status(500).json({ error: 'Internal server error. Could not store the entry.' });
  }
});

const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

app.get('/messages', (req, res) => {
  const { user, timestamp, page, size } = req.query;

  if (!user && !timestamp) {
    return res.status(400).json({
      error: 'Invalid request. At least one of "user" or "timestamp" query parameters must be provided.',
    });
  }

  if (timestamp && !DATE_REGEX.test(timestamp)) {
    return res.status(400).json({
      error: 'Invalid request. "timestamp" must be in the format dd-MM-yyyy.',
    });
  }

  const pageNum = page !== undefined ? parseInt(page, 10) : 1;
  const sizeNum = size !== undefined ? parseInt(size, 10) : 10;

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'Invalid request. "page" must be a positive number.' });
  }

  if (isNaN(sizeNum) || sizeNum < 1) {
    return res.status(400).json({ error: 'Invalid request. "size" must be a positive number.' });
  }

  try {
    let data = [];

    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    }

    const filtered = data.filter((entry) => {
      const matchesUser = user ? entry.author === user : true;
      const matchesTimestamp = timestamp ? entry.timestamp === timestamp : true;
      return matchesUser && matchesTimestamp;
    });

    const total = filtered.length;
    const startIndex = (pageNum - 1) * sizeNum;
    const paginated = filtered.slice(startIndex, startIndex + sizeNum);

    return res.status(200).json({
      total,
      page: pageNum,
      size: sizeNum,
      totalPages: Math.ceil(total / sizeNum),
      data: paginated,
    });
  } catch (err) {
    console.error('Failed to retrieve messages:', err);
    return res.status(500).json({ error: 'Internal server error. Could not retrieve messages.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

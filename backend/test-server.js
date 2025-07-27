const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test server is working' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
}); 
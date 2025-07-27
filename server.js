// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const path = require('path');
const PharmaController = require('./controllers/pharmaController');

const app = express();
const PORT = process.env.PORT || 3000;

// Create controller instance
const pharmaController = new PharmaController();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/scrape', pharmaController.scrapeAllCompanies);
app.get('/api/companies', pharmaController.getCompanies);
app.post('/api/scrape-company', pharmaController.scrapeSpecificCompany);
app.get('/api/export', pharmaController.exportToExcel);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Drug Database Agent running on http://localhost:${PORT}`);
});

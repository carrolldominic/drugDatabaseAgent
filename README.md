# Drug Database Agent

An AI-powered agent that scrapes pharmaceutical and biotech company websites to extract pipeline asset data and exports it to Excel spreadsheets.

## Features

- **100+ Companies**: Comprehensive database of pharma/biotech companies
- **AI Analysis**: Uses Groq API for intelligent data extraction
- **Excel Export**: Automated Excel file generation
- **Web Interface**: Easy-to-use browser interface
- **CLI Interface**: Command-line interface for automation
- **Batch Processing**: Efficient scraping with rate limiting
- **Individual Testing**: Test scraping on specific companies

## Data Fields Extracted

- Company Name
- Brand Name
- Generic Name
- Indication
- Therapeutic Area
- Modality
- Phase
- Next Catalyst Date

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and add your Groq API key:
```
GROQ_API_KEY=your_actual_groq_api_key_here
PORT=3000
SCRAPE_DELAY_MS=2000
MAX_CONCURRENT_REQUESTS=3
```

### 3. Get Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Create an account or sign in
3. Generate an API key
4. Add it to your `.env` file

## Usage

### Web Interface

1. **Start the Web Server**:
```bash
npm start
```

2. **Access the Interface**:
Open your browser and go to: `http://localhost:3000`

3. **Full Database Scrape**:
   - Click "Start Full Scrape" to scrape all 100+ companies
   - The process runs in the background (30-60 minutes)
   - Data is automatically exported to Excel when complete

4. **Single Company Test**:
   - Enter a company name in the search box
   - Click "Scrape Company" to test the extraction
   - Review the extracted pipeline data

5. **Export Data**:
   - Click "Export to Excel" to download the spreadsheet
   - File includes all extracted pipeline assets
   - Data is formatted with proper headers and filtering

### Command Line Interface

#### Quick Setup
```bash
node cli.js setup
```

#### Basic Commands
```bash
# Test API connection
node cli.js test

# List all companies
node cli.js list

# Scrape a single company
node cli.js scrape Pfizer

# Scrape all companies
node cli.js scrape-all --output pipeline_data.xlsx

# Check website accessibility
node cli.js check-access
```

#### Advanced Usage
```bash
# Interactive company selection
node cli.js scrape

# Custom batch processing
node cli.js scrape-all --batch-size 2 --delay 3000 --output data.xlsx

# Test specific number of companies
node cli.js check-access --sample 20
```

#### CLI Commands Reference

- `setup` - Interactive setup for API key and configuration
- `test` - Test Groq API connection
- `list` - List all companies in database
- `scrape [company]` - Scrape pipeline data for specific company
- `scrape-all` - Scrape all companies for pipeline data
- `check-access` - Check which company websites are accessible

## Technical Details

### Dependencies Used
- **express**: Web server framework
- **axios**: HTTP client for web requests
- **cheerio**: Server-side HTML parsing (jQuery-like)
- **exceljs**: Excel file generation
- **dotenv**: Environment variable management
- **commander**: CLI framework
- **chalk**: Terminal colors
- **ora**: Loading spinners
- **inquirer**: Interactive prompts

### Rate Limiting
- 2-second delay between requests (configurable)
- Maximum 3 concurrent requests (configurable)
- Respectful scraping to avoid overwhelming servers

### AI Processing
- Direct API calls to Groq (no SDK dependency)
- Uses Llama 3 70B model for data extraction
- Structured JSON output for consistent data format

### Error Handling
- Robust error handling for network issues
- Graceful degradation for failed requests
- Alternative data sources for blocked websites
- Detailed logging for troubleshooting

## File Structure
```
drug-database-agent/
├── controllers/
│   └── pharmaController.js    # Main scraping logic
├── services/
│   └── groqService.js         # Groq API integration
├── data/
│   ├── companies.js           # Company database
│   └── alternativeSources.js  # Backup data sources
├── public/
│   └── index.html             # Web interface
├── output/                    # Generated Excel files
├── cli.js                     # Command line interface
├── server.js                  # Express server
├── package.json               # Dependencies
├── .env                       # Environment variables
├── README.md                  # This file
└── CLI_README.md              # Detailed CLI documentation
```

## Configuration Options

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key (required)
- `PORT`: Server port (default: 3000)
- `SCRAPE_DELAY_MS`: Delay between requests (default: 2000ms)
- `MAX_CONCURRENT_REQUESTS`: Concurrent request limit (default: 3)

### Company Database
Edit `data/companies.js` to add/remove companies from the scraping list. Companies are organized by category and include direct pipeline page URLs for better data extraction.

## API Endpoints

- `GET /`: Web interface
- `GET /api/companies`: List all companies
- `GET /api/scrape`: Start full scrape
- `POST /api/scrape-company`: Scrape specific company
- `GET /api/export`: Download Excel file

## Troubleshooting

### Common Issues

1. **Missing API Key**
   - Ensure GROQ_API_KEY is set in .env file
   - Verify the key is valid in Groq Console
   - Use `node cli.js setup` for interactive configuration

2. **Scraping Failures (403 Forbidden)**
   - Some websites block automated requests
   - The agent includes fallback to alternative data sources
   - Use `node cli.js check-access` to test accessibility
   - Increase delay between requests: `--delay 5000`

3. **JSON Parse Errors**
   - The agent includes fallback text extraction
   - Check console logs for detailed error information
   - Most responses are handled gracefully

4. **Memory Issues**
   - Reduce MAX_CONCURRENT_REQUESTS for large scrapes
   - Use smaller batch sizes: `--batch-size 1`
   - Monitor system resources during operation

### Performance Tips

- Start with `check-access` to identify accessible websites
- Use smaller batch sizes for better reliability
- Increase delays if getting rate limited
- Test single companies before running full scrapes

### Support
For issues or questions, check the console logs for detailed error messages. The CLI provides verbose output to help troubleshoot problems.

## Global Installation (Optional)

Install globally to use from anywhere:
```bash
npm install -g .
drug-database-agent --help
```

## License
MIT License

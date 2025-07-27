const axios = require('axios');
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const groqService = require('../services/groqService');
const companies = require('../data/companies');

class PharmaController {
    constructor() {
        this.scrapedData = [];
        this.isScrapingInProgress = false;
    }

    // Get list of companies
    getCompanies = (req, res) => {
        res.json({
            success: true,
            companies: companies.pharmaCompanies,
            total: companies.pharmaCompanies.length
        });
    };

    // Scrape all companies
    scrapeAllCompanies = async (req, res) => {
        if (this.isScrapingInProgress) {
            return res.status(409).json({
                success: false,
                message: 'Scraping is already in progress'
            });
        }

        this.isScrapingInProgress = true;
        this.scrapedData = [];

        try {
            const batchSize = parseInt(process.env.MAX_CONCURRENT_REQUESTS) || 3;
            const delay = parseInt(process.env.SCRAPE_DELAY_MS) || 2000;
            
            res.json({
                success: true,
                message: 'Scraping started',
                totalCompanies: companies.pharmaCompanies.length
            });

            // Process companies in batches to avoid overwhelming servers
            for (let i = 0; i < companies.pharmaCompanies.length; i += batchSize) {
                const batch = companies.pharmaCompanies.slice(i, i + batchSize);
                
                const batchPromises = batch.map(company => 
                    this.scrapeCompanyPipeline(company).catch(error => {
                        console.error(`Error scraping ${company.name}:`, error.message);
                        return null;
                    })
                );

                const batchResults = await Promise.all(batchPromises);
                
                // Add successful results to scrapedData
                batchResults.forEach(result => {
                    if (result && result.length > 0) {
                        this.scrapedData.push(...result);
                    }
                });

                // Delay between batches
                if (i + batchSize < companies.pharmaCompanies.length) {
                    await this.sleep(delay);
                }

                console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(companies.pharmaCompanies.length/batchSize)}`);
            }

            console.log('Scraping completed. Total pipeline assets found:', this.scrapedData.length);
            
            // Auto-export to Excel
            await this.createExcelFile();
            
        } catch (error) {
            console.error('Error during scraping:', error);
        } finally {
            this.isScrapingInProgress = false;
        }
    };

    // Scrape specific company
    scrapeSpecificCompany = async (req, res) => {
        const { companyName } = req.body;
        
        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required'
            });
        }

        const company = companies.pharmaCompanies.find(
            c => c.name.toLowerCase().includes(companyName.toLowerCase())
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        try {
            const pipelineData = await this.scrapeCompanyPipeline(company);
            res.json({
                success: true,
                company: company.name,
                pipelineAssets: pipelineData,
                count: pipelineData.length
            });
        } catch (error) {
            console.error(`Error scraping ${company.name}:`, error);
            res.status(500).json({
                success: false,
                message: `Error scraping ${company.name}: ${error.message}`
            });
        }
    };

    // Handle websites that block scraping
    handleBlockedWebsite = async (company) => {
        console.log(`Website blocked for ${company.name} - trying alternative data sources`);
        
        try {
            // Try SEC filings search for pipeline information
            const secData = await this.searchSECFilings(company.name);
            if (secData && secData.length > 0) {
                return secData;
            }
            
            // Try ClinicalTrials.gov as backup
            const clinicalTrialsData = await this.searchClinicalTrials(company.name);
            if (clinicalTrialsData && clinicalTrialsData.length > 0) {
                return clinicalTrialsData;
            }
            
        } catch (error) {
            console.log(`Alternative sources failed for ${company.name}:`, error.message);
        }
        
        // Return placeholder data indicating manual review needed
        return [{
            company: company.name,
            brandName: "Manual Review Required",
            genericName: "Website Access Restricted",
            indication: `Please check ${company.website} manually`,
            therapeuticArea: "Unknown",
            modality: "Unknown", 
            phase: "Unknown",
            nextCatalystDate: "TBD"
        }];
    };

    // Search SEC filings for pipeline information
    searchSECFilings = async (companyName) => {
        try {
            // This is a simplified approach - in a real implementation you'd use SEC EDGAR API
            console.log(`Searching SEC filings for ${companyName}...`);
            
            // For now, return empty array - you could implement actual SEC API calls here
            return [];
            
        } catch (error) {
            console.log(`SEC search failed for ${companyName}:`, error.message);
            return [];
        }
    };

    // Search ClinicalTrials.gov for pipeline information  
    searchClinicalTrials = async (companyName) => {
        try {
            console.log(`Searching ClinicalTrials.gov for ${companyName}...`);
            
            const searchUrl = `https://clinicaltrials.gov/api/query/study_fields?expr=${encodeURIComponent(companyName)}&fields=NCTId,BriefTitle,Phase,Condition,InterventionName&min_rnk=1&max_rnk=10&fmt=json`;
            
            const response = await axios.get(searchUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; DrugDatabaseAgent/1.0)'
                }
            });
            
            if (response.data && response.data.StudyFieldsResponse && response.data.StudyFieldsResponse.StudyFields) {
                const studies = response.data.StudyFieldsResponse.StudyFields;
                
                return studies.map(study => ({
                    company: companyName,
                    brandName: study.InterventionName?.[0] || "TBD",
                    genericName: study.InterventionName?.[0] || "TBD", 
                    indication: study.Condition?.[0] || "TBD",
                    therapeuticArea: this.categorizeTherapeuticArea(study.Condition?.[0]),
                    modality: "Clinical Trial",
                    phase: study.Phase?.[0] || "TBD",
                    nextCatalystDate: "TBD"
                }));
            }
            
            return [];
            
        } catch (error) {
            console.log(`ClinicalTrials.gov search failed for ${companyName}:`, error.message);
            return [];
        }
    };

    // Helper to categorize therapeutic areas
    categorizeTherapeuticArea = (condition) => {
        if (!condition) return "Unknown";
        
        const conditionLower = condition.toLowerCase();
        
        if (conditionLower.includes('cancer') || conditionLower.includes('tumor') || conditionLower.includes('oncol')) {
            return "Oncology";
        } else if (conditionLower.includes('diabetes') || conditionLower.includes('metabol')) {
            return "Metabolism";
        } else if (conditionLower.includes('alzheimer') || conditionLower.includes('parkinson') || conditionLower.includes('neuro')) {
            return "Neurology";
        } else if (conditionLower.includes('arthritis') || conditionLower.includes('inflamm') || conditionLower.includes('immune')) {
            return "Immunology";
        } else {
            return "Other";
        }
    };

    // Core scraping logic for a single company
    scrapeCompanyPipeline = async (company, retryCount = 0) => {
        const maxRetries = 2;
        
        try {
            console.log(`Scraping ${company.name}...`);
            
            // Add random delay to avoid overwhelming servers
            await this.sleep(Math.random() * 2000 + 1000);
            
            // First, get the webpage content
            const response = await axios.get(company.website, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                },
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status >= 200 && status < 500; // Accept 4xx errors to handle them gracefully
                }
            });

            // Check if the request was blocked
            if (response.status === 403) {
                console.log(`Access forbidden for ${company.name} - trying alternative approach`);
                return await this.handleBlockedWebsite(company);
            }

            if (response.status !== 200) {
                console.log(`HTTP ${response.status} for ${company.name}`);
                return [];
            }

            const $ = cheerio.load(response.data);
            
            // Extract text content from the page
            let pageText = $('body').text().replace(/\s+/g, ' ').trim();
            
            // Look for pipeline-related sections
            const pipelineKeywords = ['pipeline', 'clinical', 'development', 'trials', 'phase', 'drug', 'therapeutic'];
            const pipelineSelectors = [
                '[class*="pipeline"]',
                '[id*="pipeline"]',
                '[class*="clinical"]',
                '[id*="clinical"]',
                '[class*="development"]',
                '[id*="development"]'
            ];

            let pipelineText = '';
            pipelineSelectors.forEach(selector => {
                $(selector).each((i, elem) => {
                    pipelineText += $(elem).text() + ' ';
                });
            });

            // If no specific pipeline sections found, look for relevant text
            if (pipelineText.length < 100) {
                const paragraphs = $('p, div, section').filter((i, elem) => {
                    const text = $(elem).text().toLowerCase();
                    return pipelineKeywords.some(keyword => text.includes(keyword));
                });
                
                paragraphs.each((i, elem) => {
                    pipelineText += $(elem).text() + ' ';
                });
            }

            // Limit text size for API call
            const textToAnalyze = (pipelineText || pageText).substring(0, 8000);

            if (textToAnalyze.length < 50) {
                console.log(`Insufficient content found for ${company.name}`);
                return [];
            }

            // Use Groq API to extract pipeline data
            const pipelineData = await groqService.extractPipelineData(company.name, textToAnalyze);
            
            return pipelineData || [];

        } catch (error) {
            console.error(`Error scraping ${company.name}:`, error.message);
            
            // Retry logic for network errors
            if (retryCount < maxRetries && (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT')) {
                console.log(`Retrying ${company.name} (attempt ${retryCount + 1}/${maxRetries})`);
                await this.sleep(5000); // Wait 5 seconds before retry
                return this.scrapeCompanyPipeline(company, retryCount + 1);
            }
            
            // For 403 errors or other blocks, try alternative approach
            if (error.response && error.response.status === 403) {
                return await this.handleBlockedWebsite(company);
            }
            
            return [];
        }
    };

    // Export to Excel
    exportToExcel = async (req, res) => {
        try {
            const filePath = await this.createExcelFile();
            res.download(filePath, 'pharma_pipeline_data.xlsx');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating Excel file'
            });
        }
    };

    // Create Excel file
    createExcelFile = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pipeline Data');

        // Define columns
        worksheet.columns = [
            { header: 'Company', key: 'company', width: 25 },
            { header: 'Brand Name', key: 'brandName', width: 25 },
            { header: 'Generic Name', key: 'genericName', width: 25 },
            { header: 'Indication', key: 'indication', width: 30 },
            { header: 'Therapeutic Area', key: 'therapeuticArea', width: 20 },
            { header: 'Modality', key: 'modality', width: 15 },
            { header: 'Phase', key: 'phase', width: 15 },
            { header: 'Next Catalyst Date', key: 'nextCatalystDate', width: 20 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };

        // Add data
        this.scrapedData.forEach(item => {
            worksheet.addRow(item);
        });

        // Auto-filter
        worksheet.autoFilter = 'A1:H1';

        // Save file
        const outputPath = path.join(__dirname, '../output');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const filePath = path.join(outputPath, `pharma_pipeline_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(filePath);

        console.log(`Excel file created: ${filePath}`);
        return filePath;
    };

    // Helper method for delays
    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
}

module.exports = PharmaController;

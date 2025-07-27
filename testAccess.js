const axios = require('axios');
const companies = require('./data/companies');

async function testWebsiteAccess() {
    console.log('Testing website accessibility...\n');
    
    const testCompanies = companies.pharmaCompanies.slice(0, 10); // Test first 10 companies
    
    for (const company of testCompanies) {
        try {
            const response = await axios.get(company.website, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });
            
            if (response.status === 200) {
                console.log(`✅ ${company.name}: Accessible (${response.status})`);
            } else {
                console.log(`⚠️  ${company.name}: ${response.status} - ${response.statusText}`);
            }
            
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${company.name}: ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`❌ ${company.name}: ${error.message}`);
            }
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testWebsiteAccess();

const dotenv = require('dotenv');
const groqService = require('./services/groqService');

// Load environment variables
dotenv.config();

async function testGroqConnection() {
    console.log('Testing Groq API connection...');
    
    try {
        const result = await groqService.testConnection();
        
        if (result.success) {
            console.log('✅ Groq API connection successful!');
        } else {
            console.log('❌ Groq API connection failed:', result.message);
        }
    } catch (error) {
        console.log('❌ Error testing connection:', error.message);
    }
}

// Also test extraction with sample data
async function testExtraction() {
    console.log('\nTesting pipeline data extraction...');
    
    const sampleContent = `
    Pfizer Pipeline Update
    
    PAXLOVID (nirmatrelvir-ritonavir) - COVID-19 treatment - Approved
    PF-07321332 - Oral antiviral for COVID-19 - Phase III trials completed
    
    Oncology Portfolio:
    - IBRANCE (palbociclib) - Breast cancer - Approved, additional indications in Phase III
    - LORBRENA (lorlatinib) - ALK-positive NSCLC - Phase III study ongoing
    - PF-06823859 - CDK2/4/6 inhibitor - Breast cancer - Phase I/II
    
    Rare Disease:
    - VYNDAMAX/VYNDAQEL (tafamidis) - Transthyretin amyloidosis - Approved
    - PF-06252616 - Gene therapy for Duchenne muscular dystrophy - Phase III expected 2024
    `;

    try {
        const results = await groqService.extractPipelineData('Pfizer', sampleContent);
        console.log('✅ Extraction successful! Found', results.length, 'pipeline assets:');
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.log('❌ Extraction failed:', error.message);
    }
}

async function runTests() {
    await testGroqConnection();
    
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
        await testExtraction();
    } else {
        console.log('\n⚠️  Please set your GROQ_API_KEY in the .env file to test extraction');
    }
    
    console.log('\n🚀 Ready to start the application with: npm start');
}

runTests();

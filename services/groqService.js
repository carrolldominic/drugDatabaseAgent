const axios = require('axios');
require('dotenv').config();

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        this.baseURL = 'https://api.groq.com/openai/v1';
        
        if (!this.apiKey) {
            console.warn('GROQ_API_KEY not found in environment variables');
        }
    }

    async extractPipelineData(companyName, webContent) {
        if (!this.apiKey) {
            throw new Error('Groq API key not configured');
        }

        const prompt = `Extract drug pipeline data from ${companyName} website content. Return ONLY a JSON array, no other text.

Required JSON format:
[
  {
    "company": "${companyName}",
    "brandName": "drug brand name or TBD",
    "genericName": "generic/chemical name",
    "indication": "medical condition",
    "therapeuticArea": "Oncology|Immunology|Neurology|Metabolism|Other",
    "modality": "Small Molecule|Monoclonal Antibody|Gene Therapy|Vaccine|Other",
    "phase": "Preclinical|Phase I|Phase II|Phase III|Filed|Approved",
    "nextCatalystDate": "YYYY-MM-DD or TBD"
  }
]

Website content:
${webContent}

JSON array:`;

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a data extraction tool. Return only valid JSON arrays with no additional text, explanations, or formatting.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const content = response.data.choices[0]?.message?.content?.trim();
            
            if (!content) {
                console.log(`No response content for ${companyName}`);
                return [];
            }

            // Try to parse JSON response
            try {
                // Clean up the response - remove any text before/after JSON
                let cleanedContent = content;
                
                // Remove markdown formatting
                if (content.includes('```')) {
                    cleanedContent = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
                }
                
                // Find JSON array in the response
                const jsonStart = cleanedContent.indexOf('[');
                const jsonEnd = cleanedContent.lastIndexOf(']');
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    cleanedContent = cleanedContent.substring(jsonStart, jsonEnd + 1);
                } else {
                    // Try to find JSON object and wrap in array
                    const objStart = cleanedContent.indexOf('{');
                    const objEnd = cleanedContent.lastIndexOf('}');
                    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
                        cleanedContent = '[' + cleanedContent.substring(objStart, objEnd + 1) + ']';
                    }
                }

                const pipelineData = JSON.parse(cleanedContent);
                
                if (Array.isArray(pipelineData)) {
                    console.log(`Extracted ${pipelineData.length} pipeline assets for ${companyName}`);
                    return pipelineData;
                } else if (typeof pipelineData === 'object') {
                    // Single object returned, wrap in array
                    console.log(`Extracted 1 pipeline asset for ${companyName}`);
                    return [pipelineData];
                } else {
                    console.log(`Invalid data format for ${companyName}`);
                    return [];
                }
            } catch (parseError) {
                console.error(`JSON parse error for ${companyName}:`, parseError.message);
                console.log('Raw response (first 500 chars):', content.substring(0, 500));
                
                // Try alternative extraction approach
                return this.extractDataFromText(companyName, content);
            }

        } catch (error) {
            if (error.response) {
                console.error(`Groq API error for ${companyName}:`, error.response.status, error.response.data);
            } else {
                console.error(`Request error for ${companyName}:`, error.message);
            }
            return [];
        }
    }

    // Fallback method to extract data from non-JSON text response
    extractDataFromText(companyName, textResponse) {
        console.log(`Using fallback text extraction for ${companyName}`);
        
        try {
            // Look for drug names, phases, and indications in the text
            const lines = textResponse.split('\n');
            const extractedData = [];
            
            for (const line of lines) {
                const lineLower = line.toLowerCase();
                
                // Look for phase information
                if (lineLower.includes('phase') || lineLower.includes('clinical') || lineLower.includes('trial')) {
                    let phase = 'TBD';
                    if (lineLower.includes('phase i') && !lineLower.includes('phase ii')) phase = 'Phase I';
                    else if (lineLower.includes('phase ii') && !lineLower.includes('phase iii')) phase = 'Phase II';
                    else if (lineLower.includes('phase iii')) phase = 'Phase III';
                    else if (lineLower.includes('preclinical')) phase = 'Preclinical';
                    else if (lineLower.includes('approved')) phase = 'Approved';
                    
                    // Try to extract drug name and indication from the same line
                    const words = line.split(/[,\-\(\)]/);
                    const drugName = words[0]?.trim() || 'TBD';
                    const indication = words.find(w => 
                        w.toLowerCase().includes('cancer') || 
                        w.toLowerCase().includes('diabetes') ||
                        w.toLowerCase().includes('disease')
                    )?.trim() || 'TBD';
                    
                    if (drugName && drugName.length > 2) {
                        extractedData.push({
                            company: companyName,
                            brandName: drugName,
                            genericName: drugName,
                            indication: indication,
                            therapeuticArea: this.inferTherapeuticArea(indication),
                            modality: 'TBD',
                            phase: phase,
                            nextCatalystDate: 'TBD'
                        });
                    }
                }
            }
            
            return extractedData.slice(0, 5); // Limit to 5 items to avoid noise
            
        } catch (error) {
            console.error(`Text extraction failed for ${companyName}:`, error.message);
            return [];
        }
    }

    // Helper to infer therapeutic area from indication
    inferTherapeuticArea(indication) {
        if (!indication) return 'Unknown';
        
        const indicationLower = indication.toLowerCase();
        
        if (indicationLower.includes('cancer') || indicationLower.includes('tumor') || indicationLower.includes('oncol')) {
            return 'Oncology';
        } else if (indicationLower.includes('diabetes') || indicationLower.includes('metabol')) {
            return 'Metabolism';
        } else if (indicationLower.includes('alzheimer') || indicationLower.includes('parkinson') || indicationLower.includes('neuro')) {
            return 'Neurology';
        } else if (indicationLower.includes('arthritis') || indicationLower.includes('inflamm') || indicationLower.includes('immune')) {
            return 'Immunology';
        } else {
            return 'Other';
        }
    }

    // Test API connection
    async testConnection() {
        if (!this.apiKey) {
            return { success: false, message: 'API key not configured' };
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'user',
                            content: 'Hello, respond with just "OK"'
                        }
                    ],
                    max_tokens: 10
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            return { success: true, message: 'API connection successful' };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.error?.message || error.message 
            };
        }
    }
}

module.exports = new GroqService();

#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import services
const groqService = require('./services/groqService');
const companies = require('./data/companies');
const PharmaController = require('./controllers/pharmaController');

const program = new Command();

// CLI Application
program
  .name('drug-database-agent')
  .description('AI-powered pharmaceutical pipeline data extraction tool')
  .version('1.0.0');

// Test API connection command
program
  .command('test')
  .description('Test Groq API connection')
  .action(async () => {
    const spinner = ora('Testing Groq API connection...').start();
    
    try {
      const result = await groqService.testConnection();
      
      if (result.success) {
        spinner.succeed(chalk.green('✅ Groq API connection successful!'));
      } else {
        spinner.fail(chalk.red(`❌ API connection failed: ${result.message}`));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red(`❌ Error testing connection: ${error.message}`));
      process.exit(1);
    }
  });

// List companies command
program
  .command('list')
  .description('List all companies in the database')
  .option('-c, --count', 'Show only the count')
  .action((options) => {
    if (options.count) {
      console.log(chalk.blue(`Total companies: ${companies.pharmaCompanies.length}`));
    } else {
      console.log(chalk.blue('\n📋 Companies in database:\n'));
      companies.pharmaCompanies.forEach((company, index) => {
        console.log(chalk.cyan(`${index + 1}. ${company.name}`));
      });
      console.log(chalk.blue(`\nTotal: ${companies.pharmaCompanies.length} companies`));
    }
  });

// Scrape single company command
program
  .command('scrape')
  .description('Scrape a specific company for pipeline data')
  .argument('[company]', 'Company name to scrape')
  .option('-o, --output <file>', 'Output file path (Excel format)')
  .action(async (companyName, options) => {
    try {
      let targetCompany;
      
      if (!companyName) {
        // Interactive company selection
        const choices = companies.pharmaCompanies.map(c => ({
          name: c.name,
          value: c
        }));
        
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'company',
            message: 'Select a company to scrape:',
            choices: choices,
            pageSize: 15
          }
        ]);
        
        targetCompany = answer.company;
      } else {
        // Find company by name
        targetCompany = companies.pharmaCompanies.find(
          c => c.name.toLowerCase().includes(companyName.toLowerCase())
        );
        
        if (!targetCompany) {
          console.log(chalk.red(`❌ Company "${companyName}" not found`));
          console.log(chalk.yellow('💡 Use "drug-database-agent list" to see available companies'));
          process.exit(1);
        }
      }
      
      console.log(chalk.blue(`\n🔍 Scraping ${targetCompany.name}...`));
      console.log(chalk.gray(`URL: ${targetCompany.website}\n`));
      
      const spinner = ora('Extracting pipeline data...').start();
      
      const controller = new PharmaController();
      const pipelineData = await controller.scrapeCompanyPipeline(targetCompany);
      
      spinner.stop();
      
      if (pipelineData && pipelineData.length > 0) {
        console.log(chalk.green(`✅ Found ${pipelineData.length} pipeline assets:\n`));
        
        // Display results in a table format
        pipelineData.forEach((asset, index) => {
          console.log(chalk.cyan(`${index + 1}. ${asset.brandName || asset.genericName}`));
          console.log(chalk.gray(`   Indication: ${asset.indication}`));
          console.log(chalk.gray(`   Phase: ${asset.phase}`));
          console.log(chalk.gray(`   Therapeutic Area: ${asset.therapeuticArea}`));
          console.log('');
        });
        
        // Export to Excel if requested
        if (options.output) {
          const spinner2 = ora('Generating Excel file...').start();
          controller.scrapedData = pipelineData;
          const filePath = await controller.createExcelFile();
          
          // Move to specified location if different
          if (options.output !== filePath) {
            fs.copyFileSync(filePath, options.output);
            fs.unlinkSync(filePath);
          }
          
          spinner2.succeed(chalk.green(`📊 Excel file saved: ${options.output || filePath}`));
        }
        
      } else {
        console.log(chalk.yellow('⚠️  No pipeline data found or website access was restricted'));
      }
      
    } catch (error) {
      console.log(chalk.red(`❌ Error scraping company: ${error.message}`));
      process.exit(1);
    }
  });

// Scrape all companies command
program
  .command('scrape-all')
  .description('Scrape all companies for pipeline data')
  .option('-o, --output <file>', 'Output Excel file path')
  .option('--batch-size <size>', 'Number of companies to process concurrently', '3')
  .option('--delay <ms>', 'Delay between batches in milliseconds', '2000')
  .action(async (options) => {
    console.log(chalk.blue('\n🚀 Starting full database scrape...\n'));
    console.log(chalk.gray(`Companies to process: ${companies.pharmaCompanies.length}`));
    console.log(chalk.gray(`Batch size: ${options.batchSize}`));
    console.log(chalk.gray(`Delay between batches: ${options.delay}ms\n`));
    
    const controller = new PharmaController();
    const batchSize = parseInt(options.batchSize);
    const delay = parseInt(options.delay);
    
    let totalExtracted = 0;
    let processedCompanies = 0;
    
    try {
      for (let i = 0; i < companies.pharmaCompanies.length; i += batchSize) {
        const batch = companies.pharmaCompanies.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(companies.pharmaCompanies.length / batchSize);
        
        console.log(chalk.blue(`\n📦 Processing batch ${batchNum}/${totalBatches}:`));
        
        const batchPromises = batch.map(async (company) => {
          const spinner = ora(`Scraping ${company.name}...`).start();
          
          try {
            const result = await controller.scrapeCompanyPipeline(company);
            processedCompanies++;
            
            if (result && result.length > 0) {
              totalExtracted += result.length;
              spinner.succeed(chalk.green(`${company.name}: ${result.length} assets`));
              controller.scrapedData.push(...result);
            } else {
              spinner.warn(chalk.yellow(`${company.name}: No data`));
            }
            
            return result;
          } catch (error) {
            spinner.fail(chalk.red(`${company.name}: ${error.message}`));
            return [];
          }
        });
        
        await Promise.all(batchPromises);
        
        // Progress update
        console.log(chalk.cyan(`\n📊 Progress: ${processedCompanies}/${companies.pharmaCompanies.length} companies processed`));
        console.log(chalk.cyan(`📋 Total pipeline assets found: ${totalExtracted}`));
        
        // Delay between batches
        if (i + batchSize < companies.pharmaCompanies.length) {
          const delaySpinner = ora(`Waiting ${delay}ms before next batch...`).start();
          await new Promise(resolve => setTimeout(resolve, delay));
          delaySpinner.stop();
        }
      }
      
      // Generate Excel file
      console.log(chalk.blue('\n📊 Generating Excel report...'));
      const spinner = ora('Creating Excel file...').start();
      
      const outputPath = options.output || path.join(__dirname, 'output', `pharma_pipeline_${Date.now()}.xlsx`);
      await controller.createExcelFile();
      
      // Move file if custom path specified
      if (options.output) {
        const generatedFile = path.join(__dirname, 'output', `pharma_pipeline_${Date.now()}.xlsx`);
        fs.copyFileSync(generatedFile, outputPath);
      }
      
      spinner.succeed(chalk.green(`✅ Scraping complete!`));
      
      console.log(chalk.blue('\n📈 Final Results:'));
      console.log(chalk.green(`✅ Companies processed: ${processedCompanies}`));
      console.log(chalk.green(`✅ Pipeline assets extracted: ${totalExtracted}`));
      console.log(chalk.green(`✅ Excel file: ${outputPath}`));
      
    } catch (error) {
      console.log(chalk.red(`❌ Error during full scrape: ${error.message}`));
      process.exit(1);
    }
  });

// Check website accessibility command
program
  .command('check-access')
  .description('Check which company websites are accessible')
  .option('--sample <count>', 'Number of companies to test (default: all)', companies.pharmaCompanies.length.toString())
  .action(async (options) => {
    const sampleSize = parseInt(options.sample);
    const testCompanies = companies.pharmaCompanies.slice(0, sampleSize);
    
    console.log(chalk.blue(`\n🔍 Testing accessibility for ${testCompanies.length} companies...\n`));
    
    const axios = require('axios');
    let accessible = 0;
    let blocked = 0;
    let errors = 0;
    
    for (const company of testCompanies) {
      const spinner = ora(`Testing ${company.name}...`).start();
      
      try {
        const response = await axios.get(company.website, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });
        
        if (response.status === 200) {
          spinner.succeed(chalk.green(`${company.name}: Accessible`));
          accessible++;
        } else if (response.status === 403) {
          spinner.warn(chalk.yellow(`${company.name}: Blocked (403)`));
          blocked++;
        } else {
          spinner.warn(chalk.yellow(`${company.name}: ${response.status}`));
          errors++;
        }
        
      } catch (error) {
        spinner.fail(chalk.red(`${company.name}: ${error.message}`));
        errors++;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(chalk.blue('\n📊 Accessibility Report:'));
    console.log(chalk.green(`✅ Accessible: ${accessible}`));
    console.log(chalk.yellow(`⚠️  Blocked/Issues: ${blocked + errors}`));
    console.log(chalk.cyan(`📈 Success Rate: ${Math.round((accessible / testCompanies.length) * 100)}%`));
  });

// Setup command for first-time configuration
program
  .command('setup')
  .description('Setup the application with API key and configuration')
  .action(async () => {
    console.log(chalk.blue('\n🛠️  Drug Database Agent Setup\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Groq API key:',
        validate: (input) => input.length > 0 || 'API key is required'
      },
      {
        type: 'number',
        name: 'batchSize',
        message: 'Concurrent requests (1-5):',
        default: 3,
        validate: (input) => input >= 1 && input <= 5 || 'Must be between 1 and 5'
      },
      {
        type: 'number',
        name: 'delay',
        message: 'Delay between batches (ms):',
        default: 2000,
        validate: (input) => input >= 1000 || 'Must be at least 1000ms'
      }
    ]);
    
    // Update .env file
    const envContent = `GROQ_API_KEY=${answers.apiKey}
PORT=3000
SCRAPE_DELAY_MS=${answers.delay}
MAX_CONCURRENT_REQUESTS=${answers.batchSize}
`;
    
    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    
    console.log(chalk.green('\n✅ Configuration saved!'));
    console.log(chalk.blue('🧪 Testing API connection...'));
    
    // Test the connection
    const spinner = ora('Testing Groq API...').start();
    
    try {
      // Reload environment variables
      delete require.cache[require.resolve('dotenv')];
      require('dotenv').config();
      
      const result = await groqService.testConnection();
      
      if (result.success) {
        spinner.succeed(chalk.green('✅ Setup complete! API connection successful.'));
        console.log(chalk.blue('\n🚀 You can now use:'));
        console.log(chalk.cyan('  drug-database-agent list'));
        console.log(chalk.cyan('  drug-database-agent scrape [company]'));
        console.log(chalk.cyan('  drug-database-agent scrape-all'));
      } else {
        spinner.fail(chalk.red(`❌ API test failed: ${result.message}`));
      }
    } catch (error) {
      spinner.fail(chalk.red(`❌ Setup verification failed: ${error.message}`));
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

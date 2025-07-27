// Alternative data sources for companies that block direct scraping
const alternativeDataSources = {
    "Pfizer": {
        sec_filings: "https://investors.pfizer.com/sec-filings",
        press_releases: "https://www.pfizer.com/news",
        clinical_trials: "https://clinicaltrials.gov/search?sponsor=Pfizer"
    },
    "Johnson & Johnson": {
        sec_filings: "https://www.investor.jnj.com/sec-filings",
        press_releases: "https://www.jnj.com/media-center/press-releases"
    },
    "Novartis": {
        investor_presentations: "https://www.novartis.com/investors/events-presentations",
        press_releases: "https://www.novartis.com/news/media-releases"
    },
    "AbbVie": {
        sec_filings: "https://investors.abbvie.com/sec-filings",
        pipeline_fact_sheet: "https://www.abbvie.com/content/dam/abbvie-dotcom/uploads/PDFs/news/pipeline-fact-sheet.pdf"
    }
};

// Companies with more accessible websites (less likely to block)
const accessibleCompanies = [
    { name: "Moderna", website: "https://investors.modernatx.com/news-releases" },
    { name: "BioNTech", website: "https://investors.biontech.de/news-releases" },
    { name: "CureVac", website: "https://www.curevac.com/en/pipeline/" },
    { name: "Arcturus Therapeutics", website: "https://ir.arcturusrx.com/news-releases" },
    { name: "Translate Bio", website: "https://investors.translate.bio/news-releases" }
];

module.exports = {
    alternativeDataSources,
    accessibleCompanies
};

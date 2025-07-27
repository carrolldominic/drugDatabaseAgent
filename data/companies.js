// Comprehensive list of pharmaceutical and biotechnology companies
const pharmaCompanies = [
    // Large Pharma
    { name: "Pfizer", website: "https://www.pfizer.com/science/drug-product-pipeline" },
    { name: "Johnson & Johnson", website: "https://www.jnj.com/innovation/pipeline" },
    { name: "Roche", website: "https://www.roche.com/innovation/pipeline" },
    { name: "Novartis", website: "https://www.novartis.com/research-development/pipeline" },
    { name: "Merck & Co", website: "https://www.merck.com/research/pipeline/" },
    { name: "GSK", website: "https://www.gsk.com/en-gb/research-and-development/pipeline/" },
    { name: "Sanofi", website: "https://www.sanofi.com/en/science-and-innovation/pipeline" },
    { name: "AstraZeneca", website: "https://www.astrazeneca.com/our-science/pipeline.html" },
    { name: "Bristol Myers Squibb", website: "https://www.bms.com/researchers-and-partners/pipeline-search.html" },
    { name: "AbbVie", website: "https://www.abbvie.com/science/pipeline.html" },
    { name: "Eli Lilly", website: "https://www.lilly.com/discovery/pipeline" },
    { name: "Amgen", website: "https://www.amgen.com/discover/pipeline" },
    { name: "Gilead Sciences", website: "https://www.gilead.com/science-and-medicine/pipeline" },
    { name: "Bayer", website: "https://www.bayer.com/en/pharma/pipeline" },
    { name: "Takeda", website: "https://www.takeda.com/what-we-do/research-and-development/pipeline/" },
    
    // Mid-Size Pharma
    { name: "Biogen", website: "https://www.biogen.com/en_us/pipeline.html" },
    { name: "Regeneron", website: "https://www.regeneron.com/pipeline" },
    { name: "Vertex Pharmaceuticals", website: "https://www.vrtx.com/pipeline" },
    { name: "Alexion", website: "https://alexion.com/our-research/pipeline" },
    { name: "Incyte", website: "https://www.incyte.com/pipeline" },
    { name: "BioMarin", website: "https://www.biomarin.com/products-pipeline/pipeline/" },
    { name: "Illumina", website: "https://www.illumina.com/company/news-center/feature-articles/pipeline.html" },
    { name: "Moderna", website: "https://www.modernatx.com/research/product-pipeline" },
    { name: "Kite Pharma", website: "https://www.kitepharma.com/our-pipeline" },
    { name: "Seattle Genetics", website: "https://www.seagen.com/science-innovation/our-pipeline" },
    
    // Biotech Companies
    { name: "Genentech", website: "https://www.gene.com/medical-professionals/pipeline" },
    { name: "Celgene", website: "https://www.celgene.com/pipeline/" },
    { name: "Genmab", website: "https://www.genmab.com/pipeline" },
    { name: "Alnylam", website: "https://www.alnylam.com/pipeline/" },
    { name: "Ionis Pharmaceuticals", website: "https://www.ionisph.com/pipeline" },
    { name: "Blueprint Medicines", website: "https://www.blueprintmedicines.com/science-innovation/pipeline/" },
    { name: "Agios Pharmaceuticals", website: "https://www.agios.com/pipeline/" },
    { name: "Argenx", website: "https://www.argenx.com/pipeline" },
    { name: "Ascendis Pharma", website: "https://www.ascendispharma.com/our-science/pipeline/" },
    { name: "Beam Therapeutics", website: "https://www.beamtx.com/pipeline/" },
    
    // Emerging Biotech
    { name: "CRISPR Therapeutics", website: "https://www.crisprtx.com/programs/pipeline" },
    { name: "Editas Medicine", website: "https://www.editasmedicine.com/pipeline/" },
    { name: "Intellia Therapeutics", website: "https://www.intelliatx.com/pipeline/" },
    { name: "Prime Medicine", website: "https://www.primemedicine.com/pipeline/" },
    { name: "Sangamo Therapeutics", website: "https://www.sangamo.com/pipeline/" },
    { name: "Bluebird Bio", website: "https://www.bluebirdbio.com/our-science/pipeline/" },
    { name: "CAR-T companies", website: "https://www.novartis.com/research-development/pipeline" },
    { name: "Juno Therapeutics", website: "https://www.junotherapeutics.com/pipeline/" },
    { name: "Legend Biotech", website: "https://www.legendbiotech.com/product-pipeline/" },
    { name: "2seventy bio", website: "https://www.2seventybio.com/pipeline/" },
    
    // Specialty Pharma
    { name: "Ultragenyx", website: "https://www.ultragenyx.com/pipeline/" },
    { name: "Sarepta Therapeutics", website: "https://www.sarepta.com/science/pipeline" },
    { name: "Acadia Pharmaceuticals", website: "https://www.acadia-pharm.com/pipeline/" },
    { name: "Neurocrine Biosciences", website: "https://www.neurocrine.com/pipeline/" },
    { name: "Ironwood Pharmaceuticals", website: "https://www.ironwoodpharma.com/pipeline/" },
    { name: "Horizon Therapeutics", website: "https://www.horizontherapeutics.com/pipeline-and-innovation/" },
    { name: "United Therapeutics", website: "https://www.unither.com/pipeline/" },
    { name: "Jazz Pharmaceuticals", website: "https://www.jazzpharma.com/pipeline/" },
    { name: "Alkermes", website: "https://www.alkermes.com/pipeline/" },
    { name: "Sage Therapeutics", website: "https://www.sagerx.com/pipeline/" },
    
    // Oncology Focused
    { name: "Seagen", website: "https://www.seagen.com/science-innovation/our-pipeline" },
    { name: "Exelixis", website: "https://www.exelixis.com/pipeline/" },
    { name: "Mirati Therapeutics", website: "https://www.mirati.com/pipeline/" },
    { name: "Relay Therapeutics", website: "https://www.relaytx.com/pipeline/" },
    { name: "Turning Point Therapeutics", website: "https://www.tptherapeutics.com/pipeline/" },
    { name: "Revolution Medicines", website: "https://www.revmed.com/pipeline/" },
    { name: "Black Diamond Therapeutics", website: "https://www.blackdiamondtx.com/pipeline/" },
    { name: "Myeloid Therapeutics", website: "https://www.myeloidtx.com/pipeline/" },
    { name: "Nurix Therapeutics", website: "https://www.nurixtx.com/pipeline/" },
    { name: "Kura Oncology", website: "https://www.kuraoncology.com/pipeline/" },
    
    // Immunology & Inflammation
    { name: "Prometheus Biosciences", website: "https://www.prometheusbiosciences.com/pipeline/" },
    { name: "TG Therapeutics", website: "https://www.tgtherapeutics.com/pipeline/" },
    { name: "Morphic Therapeutic", website: "https://www.morphictx.com/pipeline/" },
    { name: "Connect Biopharma", website: "https://www.connectbiopharm.com/pipeline/" },
    { name: "Ventyx Biosciences", website: "https://www.ventyxbio.com/pipeline/" },
    { name: "Gossamer Bio", website: "https://www.gossamerbio.com/pipeline/" },
    { name: "Rezolute", website: "https://www.rezolutebio.com/pipeline/" },
    { name: "Selecta Biosciences", website: "https://www.selectabio.com/pipeline/" },
    { name: "Alpine Immune Sciences", website: "https://www.alpineimmunesciences.com/pipeline/" },
    { name: "Pandion Therapeutics", website: "https://www.pandiontherapeutics.com/pipeline/" },
    
    // Gene & Cell Therapy
    { name: "Spark Therapeutics", website: "https://www.sparktx.com/pipeline/" },
    { name: "Voyager Therapeutics", website: "https://www.voyagertherapeutics.com/pipeline/" },
    { name: "Homology Medicines", website: "https://www.homologymedicines.com/pipeline/" },
    { name: "LogicBio Therapeutics", website: "https://www.logicbio.com/pipeline/" },
    { name: "Passage Bio", website: "https://www.passagebio.com/pipeline/" },
    { name: "Solid Biosciences", website: "https://www.solidbio.com/pipeline/" },
    { name: "Rocket Pharmaceuticals", website: "https://www.rocketpharma.com/pipeline/" },
    { name: "Lexeo Therapeutics", website: "https://www.lexeotx.com/pipeline/" },
    { name: "Abeona Therapeutics", website: "https://www.abeonatherapeutics.com/pipeline/" },
    { name: "Audentes Therapeutics", website: "https://www.audentestx.com/pipeline/" },
    
    // RNA Therapeutics
    { name: "Dicerna Pharmaceuticals", website: "https://www.dicerna.com/pipeline/" },
    { name: "Arrowhead Pharmaceuticals", website: "https://www.arrowheadpharma.com/pipeline/" },
    { name: "Silence Therapeutics", website: "https://www.silence-therapeutics.com/pipeline/" },
    { name: "Wave Life Sciences", website: "https://www.wavelifesciences.com/pipeline/" },
    { name: "ProQR Therapeutics", website: "https://www.proqr.com/pipeline/" },
    { name: "Translate Bio", website: "https://www.translate.bio/pipeline/" },
    { name: "RaNA Therapeutics", website: "https://www.ranatherapeutics.com/pipeline/" },
    { name: "Stoke Therapeutics", website: "https://www.stoketherapeutics.com/pipeline/" },
    { name: "Skyhawk Therapeutics", website: "https://www.skyhawktx.com/pipeline/" },
    { name: "Expansion Therapeutics", website: "https://www.expansiontherapeutics.com/pipeline/" },
    
    // Neuroscience
    { name: "Denali Therapeutics", website: "https://www.denalitherapeutics.com/pipeline/" },
    { name: "Prothena", website: "https://www.prothena.com/pipeline/" },
    { name: "Cassava Sciences", website: "https://www.cassavasciences.com/pipeline/" },
    { name: "Annovis Bio", website: "https://www.annovisbio.com/pipeline/" },
    { name: "Anavex Life Sciences", website: "https://www.anavex.com/pipeline/" },
    { name: "Athira Pharma", website: "https://www.athira.com/pipeline/" },
    { name: "Cortexyme", website: "https://www.cortexyme.com/pipeline/" },
    { name: "INmune Bio", website: "https://www.inmunebio.com/pipeline/" },
    { name: "Karuna Therapeutics", website: "https://www.karunatx.com/pipeline/" },
    { name: "Cerevel Therapeutics", website: "https://www.cerevel.com/pipeline/" }
];

module.exports = {
    pharmaCompanies
};

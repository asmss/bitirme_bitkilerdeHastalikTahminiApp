const axios = require("axios");
require("dotenv").config();

const listModels = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log("--- ERİŞEBİLECEĞİN MODELLER LİSTESİ ---");
        
        response.data.models.forEach(model => {
            console.log(`Model Adı: ${model.name}`);
            console.log(`Desteklenen İşlemler: ${model.supportedGenerationMethods.join(", ")}`);
            console.log('-----------------------------------');
        });
    } catch (error) {
        console.error("Modeller listelenirken hata oluştu:", 
            error.response ? error.response.data : error.message);
    }
};

listModels();
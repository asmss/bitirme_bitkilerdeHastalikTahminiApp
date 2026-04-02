const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const ChatKayit = require("../model/chatKayit");
const Takvim = require("../model/Takvim");
const { protect } = require("../middleware/auth");

const PYTHON_SERVER_URL = "https://kirtled-crouchingly-jarrett.ngrok-free.dev/generate-advice";

function extractTasksFromText(text, diseaseType) {
    const tasks = [];

    const keywords = {
        "temizle": { gun: 0, template: "Hastalıklı yaprakları ve dalları temizle ve imha et" },
        "budama": { gun: 0, template: "Hastalıklı kısımları budayıp uzaklaştır" },
        "budamak": { gun: 0, template: "Hastalıklı kısımları budayıp uzaklaştır" },
        "ilaçla": { gun: 1, template: "Fungisit ilaçlaması yap (Mancozeb veya Chlorothalonil)" },
        "ilaçlama": { gun: 1, template: "Fungisit ilaçlaması yap (Mancozeb veya Chlorothalonil)" },
        "sulama": { gun: 0, template: "Sulama programını kontrol et, aşırı sulanmayı önle" },
        "su tüketimi": { gun: 0, template: "Su tüketimini dengele, toprak nemini ölç" },
        "gübreleme": { gun: 2, template: "Uygun gübre uygula (Potasyum ve Fosfor içerenler)" },
        "bakır": { gun: 1, template: "Bakır sülfat solüsyonu uygula" },
        "kükürt": { gun: 1, template: "kükürt solüsyonu uygula" },
        "bakteri": { gun: 2, template: "Bakteri karşıtı solüsyon uygula" },
        "Nekroz": { gun: 2, template: "Nekrozlu bölgeleri temizle ve uygun tedaviyi uygula" },
        "Solgunluk": { gun: 3, template: "Solgunluk belirtileri için bitkileri kontrol et ve uygun önlemleri al" },
        "Dayanıklılık": { gun: 0, template: "Hastalık dayanıklılığı yüksek tohum ve fideler kullan" },
        "kireç": { gun: 1, template: "Kireç kükürt solüsyonu uygula" },
        "kontrol": { gun: 3, template: "Bitkileri kontrol et, yeni belirtileri ara" },
        "sıcaklık": { gun: 0, template: "Sıcaklık düzeyini kontrol et ve uygun ortam sağla" },
        "aeration": { gun: 0, template: "Toprak aerasyonunu sağla, sıkışıklığı önle" },
        "tohum": { gun: 0, template: "Hastalık dirençli tohum ve fidelerini seç" },
        "ışık": { gun: 0, template: "Bitkiler için yeterli ışık sağla" },
        "havalandırma": { gun: 0, template: "Sera/bahçenin havalandırmasını iyileştir" },
        "ikinci": { gun: 5, template: "İkinci doza fungisit ilaçlaması uygula" },
        "değerlendir": { gun: 10, template: "Tedavinin etkinliğini değerlendir ve gerekirse devam et" },
        "Enfeksiyon": { gun: 10, template: "Enfeksiyonun yayılmasını önlemek içi bitkileri izlemeye devam et ve gerekirse ek önlemler al" }
    };

    const textLower = text.toLowerCase();
    const foundKeywords = new Set();

    for (const [keyword, taskInfo] of Object.entries(keywords)) {
        if (textLower.includes(keyword)) {
            foundKeywords.add(keyword);
            tasks.push({
                gun: taskInfo.gun,
                gorev: taskInfo.template
            });
        }
    }

    if (tasks.length === 0) {
        tasks.push(
            { gun: 0, gorev: "Hastalıklı yaprakları ve dalları temizle ve imha et" },
            { gun: 1, gorev: "Fungisit ilaçlaması yap" },
            { gun: 3, gorev: "İkinci ilaçlama dozunu uygula" },
            { gun: 5, gorev: "Bitkileri kontrol et, yeni belirtileri ara" },
            { gun: 10, gorev: "Tedavinin etkinliğini değerlendir ve gerekirse devam et" }
        );
    }

    const uniqueTasks = {};
    tasks.forEach(task => {
        if (!uniqueTasks[task.gun]) {
            uniqueTasks[task.gun] = task.gorev;
        }
    });

    const finalTasks = Object.entries(uniqueTasks)
        .map(([gun, gorev]) => ({ gun: parseInt(gun), gorev }))
        .sort((a, b) => a.gun - b.gun)
        .slice(0, 10);

    return finalTasks;
}

router.post('/asistan/soru', protect, async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        console.log("Kullanıcıdan gelen soru:", prompt);

        const response = await axios.post(PYTHON_SERVER_URL, {
            label: prompt
        }, {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        let botAnswer = response.data.öneri;
        const diseaseType = response.data.hastalik;

        console.log(" AI Yanıtı Başarılı!");
        console.log("Hastalık Türü:", diseaseType);


        console.log("AI'dan gelen metinden takvim görevleri çıkartılıyor...");

        const takvimVerileri = extractTasksFromText(botAnswer, diseaseType);

        console.log(` ${takvimVerileri.length} görev bulundu`);

        if (takvimVerileri && Array.isArray(takvimVerileri) && takvimVerileri.length > 0) {
            try {
                for (const plan of takvimVerileri) {
                    const islemTarihi = new Date();
                    islemTarihi.setDate(islemTarihi.getDate() + plan.gun);

                    const yeniTakvimKaydi = new Takvim({
                        userId: userId,
                        bitkiAd: diseaseType || "Sohbet Asistanı",
                        hastalik: diseaseType || "Kullanıcı Sorusu",
                        gorev: plan.gorev,
                        tarih: islemTarihi,
                        aiOnerisi: true
                    });

                    await yeniTakvimKaydi.save();
                    console.log(`Gün ${plan.gun}: "${plan.gorev}" → ${islemTarihi.toLocaleDateString('tr-TR')}`);
                }

            } catch (saveError) {
                console.error("Takvim kaydetme hatası:", saveError.message);
            }
        }
        const yeniSohbet = new ChatKayit({
            userId: userId,
            soru: prompt,
            cevap: botAnswer
        });
        await yeniSohbet.save();
        console.log("Sohbet kaydedildi");
        console.log("=" + "=".repeat(79));

        res.json({ success: true, answer: botAnswer });

    } catch (error) {
        console.error("HATA DETAYI:", error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            answer: "Asistan şu an dinleniyor, lütfen biraz sonra tekrar dene."
        });
    }
});

router.get('/asistan/gecmis', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const sohbetler = await ChatKayit.find({ userId: userId }).sort({ tarih: -1 });
        res.status(200).json({ success: true, data: sohbetler });
    } catch (error) {
        console.error(" Geçmiş sohbetleri getirme hatası:", error);
        res.status(500).json({ success: false, message: "Kayıtlar getirilemedi" });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const Takvim = require("../model/Takvim");
const { protect } = require("../middleware/auth");

router.get('/liste', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const gorevler = await Takvim.find({ userId: userId }).sort({ tarih: 1 });
        res.status(200).json({ success: true, data: gorevler });
    } catch (error) {
        res.status(500).json({ success: false, message: "Takvim getirilemedi" });
    }
});

router.post('/ekle', protect, async (req, res) => {
    try {
        const { bitkiAd, hastalik, gorev, tarih, bildirimler } = req.body;
        const userId = req.user._id;

        let defaultBildirimler = bildirimler || [
            {
                turu: 'gun_oncesi',
                gun: 1,
                saat: '09:00',
                aktif: true,
                gonderildi: false
            }
        ];

        const yeniGorev = new Takvim({
            userId: userId,
            bitkiAd: bitkiAd || "Belirtilmedi",
            hastalik: hastalik || "Genel Bakım",
            gorev: gorev,
            tarih: new Date(tarih),
            bildirimler: defaultBildirimler,
            aiOnerisi: false 
        });

        await yeniGorev.save();
        console.log(`Yeni görev eklendi: ${gorev}`);

        res.status(201).json({ 
            success: true, 
            message: "Görev başarıyla eklendi",
            data: yeniGorev 
        });

    } catch (error) {
        console.error("Görev ekleme hatası:", error);
        res.status(500).json({ 
            success: false, 
            message: "Görev eklenemedi" 
        });
    }
});

router.put('/duzenle/:id', protect, async (req, res) => {
    try {
        const { gorev, tarih, bitkiAd, hastalik, bildirimler } = req.body;
        const gorevId = req.params.id;

        const guncelleGorev = {
            gorev: gorev,
            tarih: tarih ? new Date(tarih) : undefined,
            bitkiAd: bitkiAd,
            hastalik: hastalik,
            bildirimler: bildirimler
        };

        Object.keys(guncelleGorev).forEach(key => 
            guncelleGorev[key] === undefined && delete guncelleGorev[key]
        );

        const guncellenmisGorev = await Takvim.findByIdAndUpdate(
            gorevId,
            guncelleGorev,
            { new: true }
        );

        console.log(`Görev güncellendi: ${gorev}`);

        res.status(200).json({ 
            success: true, 
            message: "Görev güncellendi",
            data: guncellenmisGorev 
        });

    } catch (error) {
        console.error("Görev güncelleme hatası:", error);
        res.status(500).json({ 
            success: false, 
            message: "Görev güncellenemedi" 
        });
    }
});

router.patch('/guncelle/:id', protect, async (req, res) => {
    try {
        const gorev = await Takvim.findByIdAndUpdate(
            req.params.id, 
            { tamamlandi: req.body.tamamlandi }, 
            { new: true }
        );
        res.status(200).json({ success: true, data: gorev });
    } catch (error) {
        res.status(500).json({ success: false, message: "Güncellenemedi" });
    }
});

router.patch('/bildirim/:id', protect, async (req, res) => {
    try {
        const { bildirimler } = req.body;
        const gorev = await Takvim.findByIdAndUpdate(
            req.params.id,
            { bildirimler: bildirimler },
            { new: true }
        );
        console.log(`Bildirimler güncellendi: ${gorev.gorev}`);
        res.status(200).json({ success: true, data: gorev });
    } catch (error) {
        console.error("Bildirim güncelleme hatası:", error);
        res.status(500).json({ success: false, message: "Bildirimler güncellenemedi" });
    }
});

router.delete('/sil/:id', protect, async (req, res) => {
    try {
        await Takvim.findByIdAndDelete(req.params.id);
        console.log(`Görev silindi`);
        res.status(200).json({ success: true, message: "Görev silindi" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Görev silinemedi" });
    }
});

module.exports = router;
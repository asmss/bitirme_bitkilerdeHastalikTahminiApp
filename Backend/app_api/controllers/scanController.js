const Kayit = require("../model/Kayit");
const axios = require("axios");
const FormData = require('form-data');
const mongoose = require('mongoose');

exports.resimTanıtma = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Resim yüklenirken bir sorunla karşılaşıldı" });
        }

        const formData = new FormData();
        formData.append("image", req.file.buffer, {
            filename: "upload_image.jpg",
            contentType: req.file.mimetype
        });

        const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        const data = response.data;

        const yeniKayit = new Kayit({
            userId: req.user ? req.user._id : new mongoose.Types.ObjectId(),
            bitkiAd: data.plant_name,
            bitkiSkor: data.plant_confidence,
            hastalik: data.disease_name,
            hastalikSkor: data.disease_confidence
        });

        await yeniKayit.save();
        res.status(200).json({ succes: true, data: data, kayitId: yeniKayit._id });

    } catch (error) {
        console.error("Resim tanıma hatası : ", error.message);
        if (error.response) console.error("Flask Hatası:", error.response.data);

        res.status(500).json({ succes: false, error: "Sunucu hatası", message: "Analiz yapılamadı" });
    }
}

exports.KayıtGetir = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : "temp_user_test_id_123";

        const kayitlar = await Kayit.find({ userId: userId }).sort({ tarih: -1 });
        res.status(200).json({ succes: true, count: kayitlar.length, data: kayitlar })
    } catch (error) {
        console.error("Kayıt getirme hatası : ", error);
        res.status(500).json({ succes: false, error: "Sunucu hatası", message: "Kayıtlar getirilemedi" });
    }
}
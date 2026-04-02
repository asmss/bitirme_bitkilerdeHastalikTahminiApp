const mongoose = require("mongoose");

const TakvimSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    bitkiAd: { 
        type: String, 
        required: true,
        default: "Belirtilmedi"
    },
    hastalik: { 
        type: String, 
        default: "Genel Bakım"
    },
    gorev: { 
        type: String, 
        required: true 
    },
    tarih: { 
        type: Date, 
        required: true 
    },
    tamamlandi: { 
        type: Boolean, 
        default: false 
    },
    aiOnerisi: { 
        type: Boolean, 
        default: true 
    },
    // 🔔 BİLDİRİM AYARLARI
    bildirimler: [
        {
            turu: {
                type: String,
                enum: ['gun_oncesi', 'saat'],  // "X gün öncesi" veya "Belirli saat"
                default: 'gun_oncesi'
            },
            gun: {
                type: Number,
                default: 0  // Kaç gün öncesi (0 = aynı gün)
            },
            saat: {
                type: String,  // "08:00" formatında
                default: '09:00'
            },
            aktif: {
                type: Boolean,
                default: true
            },
            gonderildi: {
                type: Boolean,
                default: false
            }
        }
    ],
    olusturulmaTarihi: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Takvim", TakvimSchema);
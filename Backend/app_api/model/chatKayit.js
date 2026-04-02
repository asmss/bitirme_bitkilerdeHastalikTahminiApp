const mongoose = require("mongoose");

const ChatKayitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    soru: {
        type: String,
        required: true
    },
    cevap: {
        type: String,
        required: true
    },
    tarih: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ChatKayit", ChatKayitSchema);
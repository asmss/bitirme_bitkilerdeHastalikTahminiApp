const mongoose = require("mongoose");

const KayitSchema = new mongoose.Schema({
     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     bitkiAd: { type: String, required: true },
     bitkiSkor: { type: Number, required: true },
     hastalik: { type: String, required: true },
     hastalikSkor: { type: Number, required: true },
     tarih: { type: Date, default: Date.now }
})
module.exports = mongoose.model("Kayit", KayitSchema);
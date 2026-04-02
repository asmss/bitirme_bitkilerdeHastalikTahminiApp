const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const scanRoutes = require("./routes/scanRoutes");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const takvimRoutes = require('./routes/takvimRoutes');
require("dotenv").config();
connectDB();
app.use(cors({
    origin:"*"
}));
app.use(express.json());

app.use('/api/takvim', takvimRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/scan",scanRoutes);
app.use("/api/auth",authRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT,'0.0.0.0',()=>{
    console.log("server çalışıyor port : ",PORT);

})
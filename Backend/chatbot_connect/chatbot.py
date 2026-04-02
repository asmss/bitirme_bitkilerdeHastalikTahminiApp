from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import ollama

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    with open('dataset.json', 'r', encoding='utf-8') as f:
        hastalik_db = json.load(f)
except FileNotFoundError:
    print("Hata: dataset.json dosyası bulunamadı! Lütfen dosya adını kontrol et.")

class PredictionResult(BaseModel):
    label: str 

@app.post("/generate-advice")
async def generate_advice(result: PredictionResult):
    user_query = result.label.lower().strip()
    bilgi = None
    
    for key, value in hastalik_db.items():
        if user_query in key.lower() or user_query in value['turkce_ad'].lower():
            bilgi = value
            break

    system_prompt = (
        "Sen Türkiye'de görev yapan, çok tecrübeli bir ziraat mühendisisin. "
        "TEK BİR KURALIN VAR: ASLA İNGİLİZCE KONUŞMA. Tüm yanıtın %100 Türkçe olmalı. "
        "Sana teknik veriler gelse bile, sen bu verileri çiftçinin anlayacağı samimi ama profesyonel bir dille açıkla. "
        "Yanıtını Markdown formatında; kalın başlıklar ve listeler kullanarak düzenle. "
        "\n"
        "🔴 ÇOK ÖNEMLİ - ZORUNLU:\n"
        "1. Hastalık hakkında detaylı bir açıklama yap\n"
        "2. Belirtilerini listele\n"
        "3. Çözüm önerilerini açıkla\n"
        "4. MUTLAKA sonunda bir tedavi takvimi ekle\n"
        "\n"
        "TAKVIM FORMAT KURALI (GEREKLİ VURMALI KURALLARA UYMALID!):\n"
        "- Takvim SADECE aşağıdaki gibi JSON formatında olmalı\n"
        "- ```json ile başlamalı ve ``` ile bitmelidir\n"
        "- Minimum 5 görev, maksimum 14 gün içinde olmalı\n"
        "- gun değeri: bugünden (0) itibaren kaçıncı gün yapılacağını gösterir\n"
        "- gorev değeri: çiftçinin yapacağı işi açık ve net şekilde anlatmalı\n"
        "\n"
        "ÖRNEK (BU FORMATI TAKIP ET):\n"
        "```json\n"
        "[\n"
        "  {\"gun\": 0, \"gorev\": \"Hastalıklı yaprakları buda ve bahçeden uzaklaştır\"},\n"
        "  {\"gun\": 1, \"gorev\": \"Toprakta nem kontrolü yap, aşırı sulanmasını önle\"},\n"
        "  {\"gun\": 2, \"gorev\": \"Fungisit ilaçlaması yap (önerilen ürün: Mancozeb)\"},\n"
        "  {\"gun\": 5, \"gorev\": \"İkinci ilaçlama dozunu uygula\"},\n"
        "  {\"gun\": 10, \"gorev\": \"Bitkileri kontrol et, yeni belirtiler araştır\"},\n"
        "  {\"gun\": 14, \"gorev\": \"Sonuç değerlendirmesi yap ve gerekirse devam ettir\"}\n"
        "]\n"
        "```\n"
        "\n"
        "BU JSON FORMATI HERKESİN SONUNDA OLMALIDIR. HİÇ İSTİSNA YOK!"
    )

    if bilgi:
        user_content = (
            f"BİLGİ KARTI:\n"
            f"- Hastalık Adı: {bilgi['turkce_ad']}\n"
            f"- Detay: {bilgi['aciklama']}\n"
            f"- Belirtiler: {bilgi['belirtiler']}\n"
            f"- İlaçlı Tedavi: {bilgi['tedavi_kimyasal']}\n"
            f"- Doğal Yöntemler: {bilgi['tedavi_dogal']}\n\n"
            f"GÖREV: Bu hastalık hakkında detaylı bir açıklama yap, belirtilerini listele, "
            f"çözüm önerilerini sun. VE MUTLAKA SONUNDA tedavi takvimini JSON formatında ekle!"
        )
    else:
        user_content = (
            f"Kullanıcı şu hastalık ismini sordu: '{result.label}'. "
            f"Bu hastalık bizim özel veri setimizde yok. Kendi genel ziraat bilginle "
            f"SADECE TÜRKÇE olarak açıkla, belirtilerini sun ve çözüm öner. "
            f"VE MUTLAKA SONUNDA tedavi takvimini JSON formatında ekle!"
        )

    try:
        response = ollama.chat(model='llama3', messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_content},
        ])
        
        return {
            "durum": "veritabaninda_bulundu" if bilgi else "genel_bilgi",
            "hastalik": bilgi['turkce_ad'] if bilgi else result.label,
            "öneri": response['message']['content']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama Hatası: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
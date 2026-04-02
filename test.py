#!/usr/bin/env python3
import ollama
import json

# Llama 3'ü doğrudan test et
test_prompt = """
Aşağıdaki görevleri JSON formatında döndür:

```json
[
  {"gun": 0, "gorev": "Yaprakları temizle"},
  {"gun": 3, "gorev": "İlaçla"}
]
```

Başka bir şey yazma, sadece bu JSON'ı çıkart.
"""

print("=" * 60)
print("🧪 Llama 3'ü direkt test ediyorum...")
print("=" * 60)

try:
    response = ollama.chat(
        model='llama3',
        messages=[{'role': 'user', 'content': test_prompt}],
        stream=False
    )
    
    result = response['message']['content']
    print("\n✅ AI'dan gelen çıktı:")
    print("-" * 60)
    print(result)
    print("-" * 60)
    
    # JSON'ı bulmaya çalış
    if "```json" in result:
        print("\n✅ JSON markdown fence'i BULUNDU")
        # JSON'ı çıkart
        json_start = result.find("```json") + len("```json")
        json_end = result.find("```", json_start)
        json_str = result[json_start:json_end].strip()
        
        print("\n📦 Çıkarılan JSON string:")
        print(json_str)
        
        # Parse et
        try:
            parsed = json.loads(json_str)
            print("\n✅ JSON başarıyla parse edildi!")
            print(json.dumps(parsed, indent=2, ensure_ascii=False))
        except json.JSONDecodeError as e:
            print(f"\n❌ JSON parse hatası: {e}")
    else:
        print("\n❌ JSON markdown fence'i BULUNAMADI")
        print("AI'ın çıktısında ``` işareti var mı?", "```" in result)

except Exception as e:
    print(f"❌ Hata: {e}")
    print("\nOllama'nın çalışıyor olduğundan emin ol!")
    print("Komut: ollama serve")
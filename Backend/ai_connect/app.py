import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from flask import Flask, request, jsonify
import json
import io
from ultralytics import YOLO 

app = Flask(__name__)

class MultiTaskResNet(nn.Module):
    def __init__(self, num_plants, num_diseases):
        super().__init__()
        self.backbone = models.resnet34(weights=None) 
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.plant_classifier = nn.Linear(in_features, num_plants)
        self.disease_classifier = nn.Linear(in_features, num_diseases)

    def forward(self, x):
        features = self.backbone(x)
        return self.plant_classifier(features), self.disease_classifier(features)


device = torch.device("cpu") 

try:
    with open('classes.json', 'r') as f:
        class_data = json.load(f)
    PLANTS = class_data['plants']
    DISEASES = class_data['diseases']
    print(f"Sınıflar yüklendi: {len(PLANTS)} bitki, {len(DISEASES)} hastalık.")
except FileNotFoundError:
    print("HATA: classes.json dosyası bulunamadı!")
    PLANTS, DISEASES = [], []

try:
    model = MultiTaskResNet(len(PLANTS), len(DISEASES))
    model.load_state_dict(torch.load("best_model.pth", map_location=device))
    model.to(device)
    model.eval()
    print("ResNet Modeli başarıyla yüklendi!")
except Exception as e:
    print(f"ResNet Modeli yüklenirken hata oluştu: {e}")

try:
    yolo_model = YOLO("best.pt") 
    print("YOLO Modeli başarıyla yüklendi!")
except Exception as e:
    print(f"YOLO Modeli yüklenirken hata oluştu: {e}")


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'Resim bulunamadı'}), 400
    
    file = request.files['image']
    
    try:
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        yolo_results = yolo_model(image)
        
        if len(yolo_results[0].boxes) == 0:
            return jsonify({
                'success': True,
                'plant_name': "Tanımlanamadı",
                'plant_confidence': 0,
                'disease_name': "Bilinmiyor",
                'disease_confidence': 0,
                'status': 'unknown',
                'message': 'Resimde geçerli bir yaprak bulunamadı.'
            })
            

        box = yolo_results[0].boxes[0].xyxy[0].tolist() 
        
        cropped_leaf = image.crop((box[0], box[1], box[2], box[3]))
        
        img_tensor = transform(cropped_leaf).unsqueeze(0).to(device)
        
        with torch.no_grad():
            p_out, d_out = model(img_tensor)
            
            p_probs = torch.nn.functional.softmax(p_out, dim=1)
            p_conf, p_idx = torch.max(p_probs, 1)
            
            d_probs = torch.nn.functional.softmax(d_out, dim=1)
            d_conf, d_idx = torch.max(d_probs, 1)
        
        THRESHOLD = 0.80  
        is_recognized = p_conf.item() >= THRESHOLD and d_conf.item() >= THRESHOLD

        if is_recognized:
            result = {
                'success': True,
                'plant_name': PLANTS[p_idx.item()],
                'plant_confidence': round(p_conf.item() * 100, 2),
                'disease_name': DISEASES[d_idx.item()],
                'disease_confidence': round(d_conf.item() * 100, 2),
                'status': 'recognized'
            }
        else:
            result = {
                'success': True,
                'plant_name': "Tanımlanamadı",
                'plant_confidence': 0,
                'disease_name': "Bilinmiyor",
                'disease_confidence': 0,
                'status': 'unknown' 
            }
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
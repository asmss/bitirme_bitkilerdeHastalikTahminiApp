import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms
from PIL import Image
import os
import json
from tqdm import tqdm

class PlantMultiTaskDataset(Dataset):
    def __init__(self, base_dir, split='train', transform=None):
        self.split_path = os.path.join(base_dir, split)
        self.transform = transform
        self.image_paths, self.plant_labels, self.disease_labels = [], [], []

        if not os.path.exists(self.split_path):
            raise FileNotFoundError(f"Klasör bulunamadı: {self.split_path}")

        self.plant_names = sorted([d for d in os.listdir(self.split_path) if os.path.isdir(os.path.join(self.split_path, d))])
        self.plant_to_idx = {name: i for i, name in enumerate(self.plant_names)}
        
        all_disease_names = set()
        for plant in self.plant_names:
            p_path = os.path.join(self.split_path, plant)
            diseases = [d for d in os.listdir(p_path) if os.path.isdir(os.path.join(p_path, d))]
            all_disease_names.update(diseases)
        
        self.disease_names = sorted(list(all_disease_names))
        self.disease_to_idx = {name: i for i, name in enumerate(self.disease_names)}

        for plant in self.plant_names:
            plant_path = os.path.join(self.split_path, plant)
            for disease in os.listdir(plant_path):
                disease_path = os.path.join(plant_path, disease)
                if not os.path.isdir(disease_path): continue
                for img_name in os.listdir(disease_path):
                    if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        self.image_paths.append(os.path.join(disease_path, img_name))
                        self.plant_labels.append(self.plant_to_idx[plant])
                        self.disease_labels.append(self.disease_to_idx[disease])

    def __len__(self): return len(self.image_paths)
    def __getitem__(self, idx):
        img = Image.open(self.image_paths[idx]).convert('RGB')
        if self.transform: img = self.transform(img)
        return img, self.plant_labels[idx], self.disease_labels[idx]

class MultiTaskResNet(nn.Module):
    def __init__(self, num_plants, num_diseases):
        super().__init__()
        self.backbone = models.resnet34(weights='DEFAULT')
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.plant_classifier = nn.Linear(in_features, num_plants)
        self.disease_classifier = nn.Linear(in_features, num_diseases)

    def forward(self, x):
        features = self.backbone(x)
        return self.plant_classifier(features), self.disease_classifier(features)

def main():
    DATA_DIR = "DATASET" 
    BATCH_SIZE = 32
    EPOCHS = 20
    device = torch.device("mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu")
    print(f"Cihaz: {device} kullanılıyor.")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    print("Veri seti yükleniyor...")
    train_ds = PlantMultiTaskDataset(DATA_DIR, 'train', transform)
    val_ds = PlantMultiTaskDataset(DATA_DIR, 'valid', transform)
    
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, num_workers=0)
    print(f"Veri hazır! Resim sayısı: {len(train_ds)}")

    model = MultiTaskResNet(len(train_ds.plant_names), len(train_ds.disease_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    
    best_val_loss = float('inf')
    patience = 3 
    counter = 0

    for epoch in range(EPOCHS):
        if epoch < 5:
            for param in model.backbone.parameters(): param.requires_grad = False
            optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=0.001)
        else:
            for param in model.backbone.parameters(): param.requires_grad = True
            optimizer = optim.Adam(model.parameters(), lr=0.0001)

        model.train()
        train_loss = 0
        for imgs, p_labels, d_labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Eğitim]"):
            imgs, p_labels, d_labels = imgs.to(device), p_labels.to(device), d_labels.to(device)
            optimizer.zero_grad()
            p_out, d_out = model(imgs)
            loss = criterion(p_out, p_labels) + criterion(d_out, d_labels)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        model.eval()
        val_loss, correct_p, total = 0, 0, 0
        with torch.no_grad():
            for imgs, p_labels, d_labels in tqdm(val_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Validasyon]"):
                imgs, p_labels, d_labels = imgs.to(device), p_labels.to(device), d_labels.to(device)
                p_out, d_out = model(imgs)
                val_loss += (criterion(p_out, p_labels) + criterion(d_out, d_labels)).item()
                _, pred_p = torch.max(p_out, 1)
                correct_p += (pred_p == p_labels).sum().item()
                total += p_labels.size(0)

        avg_val_loss = val_loss / len(val_loader)
        acc = 100 * correct_p / total
        print(f"\n>> Epoch {epoch+1} Sonucu: Val Loss: {avg_val_loss:.4f} | Bitki Doğruluğu: %{acc:.2f}")

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), "best_model.pth")
            counter = 0
            print("--- En iyi model kaydedildi! ---")
        else:
            counter += 1
            if counter >= patience:
                print("Gelişme durdu, Early Stopping devrede.")
                break

    with open("classes.json", "w") as f:
        json.dump({"plants": train_ds.plant_names, "diseases": train_ds.disease_names}, f)
    print("İşlem tamamlandı.")

if __name__ == "__main__":
    main()
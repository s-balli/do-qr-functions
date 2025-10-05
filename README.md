# QR Kod Oluşturucu - DigitalOcean Function

DigitalOcean Functions kullanarak basit bir QR kod oluşturucu servisi.

## 📁 Proje Yapısı

```
DO-Functions/
├── project.yml                    # DigitalOcean konfigürasyonu
├── README.md                      # Bu dosya
└── packages/
    └── qr/
        └── qr-generator/
            ├── index.js           # Ana fonksiyon
            └── package.json       # Bağımlılıklar
```

## 🚀 Kurulum

### 1. DigitalOcean CLI Kurulumu (doctl)

```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.98.0/doctl-1.98.0-linux-amd64.tar.gz
tar xf doctl-1.98.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin

# Windows (Scoop ile)
scoop install doctl
```

### 2. DigitalOcean'a Giriş

```bash
doctl auth init
# API token'ınızı girin (https://cloud.digitalocean.com/account/api/tokens)
```

### 3. Serverless Plugin Kurulumu

```bash
doctl serverless install
```

### 4. Functions Namespace Bağlama

```bash
doctl serverless connect
# Namespace oluşturmak için (ilk kez)
doctl serverless namespaces create --region fra1 --label my-namespace
```

## 📦 Deploy Etme

```bash
# Projeyi deploy et
doctl serverless deploy .

# Deploy sonrası URL'yi görmek için
doctl serverless functions list
```

Deploy sonrası şuna benzer bir URL alacaksınız:
```
https://faas-fra1-xxxxxxxx.doserverless.co/api/v1/web/fn-xxxxxxxx/qr/qr-generator
```

## 💻 Kullanım

### Örnek 1: Basit Metin QR Kodu (Base64)

```bash
curl -X POST \
  "https://YOUR-FUNCTION-URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Merhaba Dünya!"}'
```

**Yanıt:**
```json
{
  "success": true,
  "text": "Merhaba Dünya!",
  "format": "base64",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "info": "Base64 formatında - <img src=\"...\" /> ile kullanabilirsiniz"
}
```

### Örnek 2: URL QR Kodu

```bash
curl -X POST \
  "https://YOUR-FUNCTION-URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "https://digitalocean.com", "size": 500}'
```

### Örnek 3: Renkli QR Kod

```bash
curl -X POST \
  "https://YOUR-FUNCTION-URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "https://github.com",
    "color": "#0066CC",
    "background": "#FFFFFF",
    "size": 400
  }'
```

### Örnek 4: SVG Format

```bash
curl -X POST \
  "https://YOUR-FUNCTION-URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "SVG QR Kod", "format": "svg"}'
```

## 🌐 HTML'de Kullanım

```html
<!DOCTYPE html>
<html>
<head>
    <title>QR Kod Oluşturucu</title>
</head>
<body>
    <h1>QR Kod Oluşturucu</h1>
    <input type="text" id="qrText" placeholder="Metin veya URL girin">
    <button onclick="generateQR()">QR Kod Oluştur</button>
    <div id="result"></div>

    <script>
        async function generateQR() {
            const text = document.getElementById('qrText').value;

            const response = await fetch('YOUR-FUNCTION-URL', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text, size: 300 })
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('result').innerHTML =
                    `<img src="${data.qrCode}" alt="QR Kod">`;
            }
        }
    </script>
</body>
</html>
```

## ⚙️ Parametreler

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| `text` | string | - | QR koda dönüştürülecek metin/URL (zorunlu) |
| `size` | number | 300 | QR kod boyutu (piksel) |
| `format` | string | "base64" | Çıktı formatı: "base64", "svg", "png" |
| `color` | string | "#000000" | QR kod rengi (hex kod) |
| `background` | string | "#FFFFFF" | Arka plan rengi (hex kod) |

## 🧪 Yerel Test

DigitalOcean fonksiyonları yerel olarak test etmek için:

```bash
# Yerel sunucuyu başlat
doctl serverless undeploy --all
doctl serverless deploy . --remote-build
```

## 📊 Maliyet Hesaplama

**Örnek Senaryo:**
- Fonksiyon: 256MB hafıza
- Çalışma süresi: Ortalama 0.5 saniye
- Aylık çağrı: 10,000

**Hesaplama:**
- GiB-second = 0.25 GiB × 0.5 saniye = 0.125 GiB-second
- Toplam = 10,000 × 0.125 = 1,250 GiB-second
- **Ücretsiz** (90,000 GiB-second limiti içinde)

## 📚 Öğrenci Projeleri İçin İpuçları

1. **WiFi QR Kod:** WiFi bilgilerini QR koda çevir
2. **vCard QR:** İletişim bilgilerini QR kod yap
3. **Toplu QR:** Birden fazla QR kod oluştur
4. **QR Analytics:** QR kod kullanım istatistikleri
5. **Custom Logo:** QR kod ortasına logo ekle

## 🛠️ Geliştirme

```bash
# Logları görüntüle
doctl serverless activations list
doctl serverless activations get <activation-id>

# Fonksiyonu güncelle
# Değişiklikleri yap, sonra:
doctl serverless deploy .
```

## 🔧 Sorun Giderme

### Deploy Hatası
```bash
# Namespace'i kontrol et
doctl serverless status

# Yeniden bağlan
doctl serverless connect
```

### Fonksiyon Çalışmıyor
```bash
# Logları kontrol et
doctl serverless activations logs --limit 5
```

## 📖 Kaynaklar

- [DigitalOcean Functions Docs](https://docs.digitalocean.com/products/functions/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
- [QRCode.js Docs](https://github.com/soldair/node-qrcode)

## 📝 Lisans

Eğitim amaçlı örnek proje - Özgürce kullanabilirsiniz.

---

**Not:** `YOUR-FUNCTION-URL` kısmını kendi fonksiyon URL'inizle değiştirin.

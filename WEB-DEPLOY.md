# 🌐 Web Üzerinden Deploy Rehberi

DigitalOcean Functions'ı CLI kullanmadan, sadece web arayüzünden deploy etme rehberi.

## Yöntem 1: Doğrudan Functions (Manuel)

### Adım 1: Functions Sayfasına Git
1. [DigitalOcean Dashboard](https://cloud.digitalocean.com) → Sol menüden **"Functions"** seç
2. **"Create Namespace"** butonuna tıkla (ilk kez ise)
   - Name: `my-functions`
   - Region: Frankfurt (fra1) veya istediğin
   - **Create** tıkla

### Adım 2: Function Oluştur
1. **"Create Function"** butonuna tıkla
2. Ayarları doldur:
   - **Name:** `qr-generator`
   - **Runtime:** Node.js 18
   - **Memory:** 256 MB
   - **Timeout:** 10000 ms (10 saniye)

### Adım 3: Kodu Yapıştır

**Code sekmesinde:**

Aşağıdaki kodu **index.js** olarak yapıştır:

```javascript
const QRCode = require('qrcode');

async function main(args) {
  try {
    const text = args.text || args.url;
    const size = args.size || 300;
    const format = args.format || 'base64';

    if (!text) {
      return {
        statusCode: 400,
        body: {
          error: 'Lütfen "text" veya "url" parametresi gönderin',
          example: { text: 'https://digitalocean.com' }
        }
      };
    }

    const options = {
      width: size,
      margin: 2,
      color: {
        dark: args.color || '#000000',
        light: args.background || '#FFFFFF'
      }
    };

    let qrData;

    switch (format) {
      case 'base64':
        qrData = await QRCode.toDataURL(text, options);
        return {
          statusCode: 200,
          body: {
            success: true,
            text: text,
            format: 'base64',
            qrCode: qrData,
            info: 'Base64 formatında - <img src="..." /> ile kullanabilirsiniz'
          }
        };

      case 'svg':
        qrData = await QRCode.toString(text, { ...options, type: 'svg' });
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'image/svg+xml' },
          body: qrData
        };

      case 'png':
        const buffer = await QRCode.toBuffer(text, options);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'image/png' },
          body: buffer.toString('base64')
        };

      default:
        return {
          statusCode: 400,
          body: {
            error: 'Geçersiz format. Kullanılabilir: base64, svg, png',
            receivedFormat: format
          }
        };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: {
        error: 'QR kod oluşturulurken hata oluştu',
        details: error.message
      }
    };
  }
}

exports.main = main;
```

### Adım 4: Dependencies Ekle

**Dependencies (package.json) sekmesinde:**

```json
{
  "name": "qr-generator",
  "version": "1.0.0",
  "dependencies": {
    "qrcode": "^1.5.3"
  }
}
```

### Adım 5: Deploy Et!

1. **"Save"** butonuna tıkla
2. **"Deploy"** butonuna tıkla
3. Deploy tamamlanınca **URL'yi kopyala**

Şuna benzer bir URL alacaksın:
```
https://faas-fra1-XXXXXXXX.doserverless.co/api/v1/web/fn-XXXXXXXX/default/qr-generator
```

---

## Yöntem 2: GitHub + App Platform (Otomatik - Önerilen)

### Adım 1: GitHub'a Yükle

Proje klasöründe:

```bash
git init
git add .
git commit -m "QR kod oluşturucu"
```

GitHub'da yeni repo oluştur, sonra:

```bash
git remote add origin https://github.com/KULLANICI_ADI/do-qr-functions.git
git branch -M main
git push -u origin main
```

### Adım 2: DigitalOcean App Platform

1. [App Platform](https://cloud.digitalocean.com/apps) → **"Create App"**
2. **GitHub'ı bağla** → Repo'nu seç
3. DigitalOcean otomatik algılar:
   - ✅ `project.yml` bulur
   - ✅ Functions olduğunu anlar
   - ✅ Ayarları otomatik yapar
4. **Next** → **Create Resources** → **Deploy**

### Avantajları:
- ✅ Her `git push` → Otomatik deploy
- ✅ Versiyon kontrolü
- ✅ Rollback yapabilirsin
- ✅ CI/CD pipeline

---

## Yöntem 3: DigitalOcean CLI (Tek Komut)

En hızlı yöntem:

```bash
# İlk kurulum
doctl auth init
doctl serverless install
doctl serverless connect

# Deploy
doctl serverless deploy .
```

---

## 🧪 Test Etme

Deploy sonrası URL'ni kopyala ve test et:

### cURL ile:
```bash
curl -X POST \
  "YOUR-FUNCTION-URL" \
  -H "Content-Type: application/json" \
  -d '{"text": "Merhaba Dünya!"}'
```

### test.html ile:
1. `test.html` dosyasını aç
2. İçindeki `YOUR-FUNCTION-URL-HERE` kısmını URL'inle değiştir
3. Tarayıcıda aç
4. Test et!

### Postman ile:
1. **POST** request oluştur
2. URL: Fonksiyon URL'in
3. Body → raw → JSON:
   ```json
   {
     "text": "https://digitalocean.com",
     "size": 400
   }
   ```
4. **Send** tıkla

---

## 📊 Hangi Yöntemi Seçmeli?

| Yöntem | Zorluk | Hız | Önerilen? |
|--------|--------|-----|-----------|
| **Manuel (Web)** | ⭐ Kolay | 🐌 Yavaş | Deneme için |
| **GitHub + App** | ⭐⭐ Orta | 🚀 Otomatik | ✅ En iyi |
| **CLI (doctl)** | ⭐⭐⭐ Zor | ⚡ En hızlı | Gelişmiş |

**Önerim:** Önce **manuel** dene, sonra **GitHub + App Platform** kullan.

---

## ❓ Sorun Giderme

### "Module not found: qrcode"
- Dependencies kısmında `qrcode` paketini ekle
- Deploy'u yeniden yap

### "Function timeout"
- Timeout süresini 15000 ms'ye çıkar
- Memory'yi 512 MB yap

### "Cannot read property 'text'"
- POST request gönderdiğinden emin ol
- Body'de JSON formatında `text` parametresi olmalı

---

## 🎓 Öğrenciler İçin İpuçları

1. **İlk denemede** → Manuel web deploy kullan
2. **Proje geliştirirken** → GitHub + App Platform
3. **Birden fazla fonksiyon** → CLI öğren

Web deploy **sunucu bilgisi gerektirmez**, tamamen görsel arayüzden yapılır!

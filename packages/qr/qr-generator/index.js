const QRCode = require('qrcode');

/**
 * DigitalOcean Function - QR Kod Oluşturucu
 *
 * Kullanım:
 * - text: QR koda dönüştürülecek metin/URL (zorunlu)
 * - size: QR kod boyutu (varsayılan: 300)
 * - format: Çıktı formatı: 'base64', 'png', 'svg' (varsayılan: 'base64')
 */

async function main(args) {
  // CORS başlıkları DigitalOcean App Platform tarafından otomatik yönetildiği için
  // burada manuel olarak eklemiyoruz, aksi takdirde "multiple values" hatası alınıyor.
  const responseHeaders = {
    'Content-Type': 'application/json'
  };

  try {
    // OPTIONS preflight istekleri platform tarafından karşılandığı için kod bloğu kaldırıldı.

    // Parametreleri al
    const text = args.text || args.url;
    const size = args.size || 300;
    const format = args.format || 'base64';

    // Metin kontrolü
    if (!text) {
      return {
        statusCode: 400,
        headers: responseHeaders,
        body: {
          error: 'Lütfen "text" veya "url" parametresi gönderin',
          example: { text: 'https://digitalocean.com' }
        }
      };
    }

    // QR kod seçenekleri
    const margin = args.margin !== undefined ? parseInt(args.margin) : 1;
    const errorCorrectionLevel = ['L', 'M', 'Q', 'H'].includes(args.errorCorrectionLevel) ? args.errorCorrectionLevel : 'M';

    const options = {
      width: size,
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: args.color || '#000000',
        light: args.background || '#FFFFFF'
      }
    };

    let qrData;

    // Format'a göre QR kod oluştur
    switch (format) {
      case 'base64':
        qrData = await QRCode.toDataURL(text, options);
        return {
          statusCode: 200,
          headers: responseHeaders,
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
          headers: {
            ...responseHeaders,
            'Content-Type': 'text/plain'
          },
          body: qrData
        };

      case 'png':
        const buffer = await QRCode.toBuffer(text, options);
        return {
          statusCode: 200,
          headers: {
            ...responseHeaders,
            'Content-Type': 'image/png'
          },
          body: buffer.toString('base64')
        };

      default:
        return {
          statusCode: 400,
          headers: responseHeaders,
          body: {
            error: 'Geçersiz format. Kullanılabilir: base64, svg, png',
            receivedFormat: format
          }
        };
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: {
        error: 'QR kod oluşturulurken hata oluştu',
        details: error.message
      }
    };
  }
}

exports.main = main;

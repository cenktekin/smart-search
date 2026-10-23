# Sorun Giderme

## 1. AI hiç yanıt vermiyor / "API anahtarı tanımlı değil" uyarısı

**Neden**: `VITE_OPENROUTER_API_KEY` build sırasında tanımlı değil.

**Çözüm**:

```powershell
Copy-Item .env.example .env.local
# .env.local içine: VITE_OPENROUTER_API_KEY=sk-or-...
npm run dev
```

Notlar:

- Ad `VITE_` ile başlamalı; aksi hâlde tarayıcıya taşınmaz.
- Değişken build sırasında gömülür; `.env.local` değiştirdikten sonra dev sunucusunu (veya `npm run build` sonrası `preview`'ı) yeniden başlatın.

## 2. 401 / 403

Anahtar geçersiz, iptal edilmiş veya model için yetkisiz. [OpenRouter anahtar sayfasından](https://openrouter.ai/keys) kontrol edin. 4xx hatalarında istek **yeniden denenmez**; konsolda `Client error: 401 ...` görürsünüz.

## 3. Zaman aşımı

```
Timeout after 3 retries: 30000ms timeout exceeded.
```

Sohbet isteklerinde sınır 30 saniyedir (`lib/http.ts`). Daha kısa istek yazın, daha hızlı model seçin veya sınırı `CHAT_TIMEOUT_MS` üzerinden artırın.

## 4. AI yanıtı sorguya dönüşmüyor

Ayrıştırıcı sırayla şunları dener: doğrudan JSON → `parts` alanı → metindeki `[...]` → metindeki `{...}`. Hepsi başarısız olursa istek metni tek `text` parçası olarak eklenir.

Kontrol listesi:

- Model JSON üretmeyi destekliyor mu? (`response_format: json_object` desteklemeyen modeller 400 dönebilir.)
- Konsolda `AI query generation failed` var mı?
- Sistem talimatındaki operatör kataloğu `locales/data.ts` ile uyuşuyor mu? (Katalog dinamik üretilir.)

## 5. Operatör eklenmiyor / yanlış operatör

- Operatör kimliği `locales/data.ts` içinde hem EN hem TR listesinde olmalı.
- Model bilinmeyen bir `operatorId` döndürürse parça `text` olarak eklenir (bilinçli geri düşüş).
- `OR` ve `*` operatörleri değer almaz; sorguya doğrudan kendi işaretleriyle yazılır.

## 6. Sorgu kayboldu / eski sorgu geri geldi

Sorgu `localStorage`'da (`searchQuery`) tutulur ve `?q=` parametresi localStorage'dan **önce** gelir. Adres çubuğunda `?q=` varsa sorgu oradan yüklenir.

- Temiz başlangıç: `localStorage.removeItem('searchQuery')` veya adresteki `?q=` parametresini silin.
- Paylaşılan bağlantı: sorgu `?q=` olarak yazıldığı için bağlantıyı alan kişi aynı sorguyu görür.

## 7. Tema/dil değişmiyor

`localStorage` anahtarları: `theme`, `language`. Gizli sekmede veya depolama engelliyse seçim kalıcı olmaz. Konsolda depolama hatası varsa tarayıcı gizlilik ayarlarını kontrol edin.

## 8. Build veya tip hatası

```bash
npm run typecheck
npm run build
```

- `Cannot find type definition file for 'node'` → `npm install` (devDependencies gerekli; `npm config omit=dev` açıksa `npm ci --include=dev`).
- Kilit dosyası çakışması → yalnızca npm kullanın, `package-lock.json` tek otoritedir.

## 9. Sayfa stilize görünmüyor

Tailwind CDN betiği engellenmiş olabilir (`index.html` → `cdn.tailwindcss.com`). Kurumsal proxy/reklam engelleyici bu alan adını kapatıyorsa `kde-*` renkleri ve yardımcı sınıflar uygulanmaz.

## Destek

Hata bildirirken şunları ekleyin: tarayıcı sürümü, Node sürümü, seçili model, konsol hatası ve adres çubuğundaki `?q=` değeri. API anahtarınızı **asla** paylaşmayın.

[GitHub Issues](https://github.com/cenktekin/smart-search/issues)

<div align="center">
<img width="800" alt="Smart Search Operator Page" src="Smart Search Operator Page.png" />
</div>

# Smart Search Operator Page

Google arama operatörleriyle hassas sorgular kuran, AI destekli bir sorgu oluşturucu. Doğal dilde yazdığınız isteği operatörlü bir arama sorgusuna çevirir, canlı önizleme gösterir ve tek tıkla Google'da arar.

## Özellikler

- **AI Query Assistant** — doğal dil isteğini yapılandırılmış sorgu parçalarına çevirir (OpenRouter)
- **Query Builder** — metin parçaları ve operatör kartlarıyla görsel sorgu kurma
- **Live Preview** — oluşan sorgunun anlık önizlemesi ve Google arama bağlantısı
- **Operator Library** — 11 Google operatörü, kategori filtreli
- **Manifesto Mode** — hazır arama şablonları (bilimsel öncelik, etik & odaklı)
- **Paylaşılabilir bağlantı** — sorgu adres çubuğuna `?q=` olarak yazılır, bağlantıyı paylaşan aynı sorguyu görür
- **Kalıcı durum** — sorgu, dil ve tema `localStorage`'da tutulur
- **Koyu/açık tema**, Türkçe/İngilizce arayüz, duyarlı tasarım

## Teknoloji

| Katman | Seçim |
|---|---|
| UI | React 19 + TypeScript 5.8 |
| Build | Vite 6 |
| Stil | Tailwind CSS (CDN üzerinden, `index.html` içinde yapılandırılmış) |
| AI | OpenRouter Chat Completions API (`response_format: json_object`) |
| Test | Yok — bkz. [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |

## Kurulum

Gereksinimler: Node.js 18+ ve bir [OpenRouter API anahtarı](https://openrouter.ai/keys).

```bash
npm install
cp .env.example .env.local     # Windows PowerShell: Copy-Item .env.example .env.local
# .env.local içine kendi anahtarınızı yazın:
# VITE_OPENROUTER_API_KEY=sk-or-...
npm run dev
```

AI asistanı anahtar yokken de arayüzü bozmaz; yalnızca "anahtar tanımlı değil" uyarısı gösterir.

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi (`dist/`) |
| `npm run preview` | Derlemeyi yerel olarak sunar |
| `npm run typecheck` | `tsc --noEmit` ile tip kontrolü |

## Desteklenen operatörler

| Operatör | Açıklama |
|---|---|
| `site:` | Sonuçları belirli bir alan adıyla sınırlar |
| `filetype:` | Belirli dosya türü (pdf, docx, pptx...) |
| `intitle:` | Başlıkta geçmesi gereken kelime |
| `inurl:` | URL'de geçmesi gereken kelime |
| `related:` | Verilen alan adına benzer siteler |
| `cache:` | Sayfanın önbellek kopyası |
| `define:` | Terim tanımı |
| `" "` | Tam ifade eşleşmesi |
| `OR` | İki alternatiften biri |
| `-` | Kelimeyi hariç tut |
| `*` | Bilinmeyen terim yer tutucusu |

## Proje yapısı

```
.
├── App.tsx                     # Uygulama kabuğu, sorgu durumu
├── index.tsx                   # React giriş noktası
├── index.html                  # HTML kabuğu, Tailwind yapılandırması
├── components/                 # QueryBuilder, SearchPreview, AIQueryGenerator...
├── contexts/LocalizationContext.tsx
├── hooks/useAIQuery.ts         # Model listesi, AI isteği, hata durumu
├── lib/ai.ts                   # Sistem talimatı, yanıt ayrıştırma
├── lib/http.ts                 # Zaman aşımlı, yeniden denemeli fetch
├── lib/query.ts                # Sorgu metni üretimi, ?q= paylaşımı
├── locales/                    # EN/TR arayüz metinleri, operatörler, manifestolar
├── types.ts
└── docs/                       # AI entegrasyonu, geliştirme, sorun giderme
```

## AI asistanı nasıl çalışır

1. İstek, kullanılabilir operatör kataloğuyla birlikte sisteme gönderilir; modelden yalnızca `{"parts": [...]}` biçiminde JSON istenir.
2. Yanıt ayrıştırılır: `parts` dizisi, çıplak dizi veya metin içine gömülü JSON kabul edilir.
3. Bilinmeyen operatör kimlikleri metin parçasına düşer; ayrıştırma tamamen başarısız olursa istek metni tek parça olarak kullanılır.
4. İsteklerde 30 saniye zaman aşımı ve üstel geri çekilmeli 3 deneme vardır.

Varsayılan model `openai/gpt-oss-20b:free`; anahtar geçerliyse OpenRouter model listesiyle değiştirilebilir.

## Bilinen sınırlar

- **API anahtarı istemcide**: `VITE_` ile build'e gömülür, tarayıcıdan görülebilir. Yalnızca kendi/yerel kullanımınız için anahtar kullanın; herkese açık bir kurulumda araya sunucu proxy'si koyun.
- **Tailwind CDN'den yükleniyor**: üretim için derlenmiş CSS'e geçiş planlanıyor.
- **Otomatik test yok**: kapılar şu an `typecheck` + `build`.
- Sorgular Google'a gönderilmez; arama bağlantısı yeni sekmede açılır.

## Dokümanlar

- [docs/AI_INTEGRATION.md](docs/AI_INTEGRATION.md) — AI akışı, istem şeması, ayrıştırma
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) — mimari, geliştirme akışı, kod düzeni
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — yaygın sorunlar ve çözümleri

## Lisans

MIT — bkz. [LICENSE](LICENSE).

## İletişim

- GitHub Issues: [cenktekin/smart-search/issues](https://github.com/cenktekin/smart-search/issues)
- E-posta: [cenktekin@duck.com](mailto:cenktekin@duck.com)

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/cenktekin)

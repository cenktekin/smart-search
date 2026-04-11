<div align="center">
<img width="800" alt="Smart Search Operator Page" src="Smart Search Operator Page.png" />
</div>

# Smart Search Operator Page

Akıllı arama sorgusu oluşturucu ve AI destekli query builder. Kullanıcıların doğal dil ile arama sorguları oluşturmasını, Google arama operatörlerini kullanarak daha etkili sonuçlar almasını sağlayan modern bir web uygulaması.

## 🚀 Özellikler

- **AI Query Assistant**: Doğal dil ile akıllı arama sorguları oluşturma
- **Smart Query Builder**: Görsel arama sorgusu oluşturma arayüzü
- **Google Search Operators**: `site:`, `intitle:`, `-` (hariç tutma) gibi operatörler
- **Manifesto Mode**: Önceden tanımlanmış arama şablonları
- **Live Preview**: Gerçek zamanlı arama sorgu önizleme
- **Dark/Light Theme**: Koyu ve aydınlık tema desteği
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm

## 🛠️ Teknoloji Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, KDE tema sistemi
- **AI Integration**: OpenRouter API
- **State Management**: React Hooks
- **Localization**: Çoklu dil desteği

## 📦 Kurulum

### Ön Gereksinimler

- Node.js (v16 veya üzeri)
- OpenRouter API anahtarı

### Kurulum Adımları

1. **Bağımlılıkları yükleme**:
   ```bash
   npm install
   ```

2. **API Anahtarını Ayarlama**:
   - `.env.local` dosyasını oluştur
   - `VITE_OPENROUTER_API_KEY` değişkenini OpenRouter API anahtarın ile doldur

   ```bash
   # .env.local dosyası içeriği
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

3. **Uygulamayı Çalıştırma**:
   ```bash
   npm run dev
   ```

4. **Üretim Derleme**:
   ```bash
   npm run build
   ```

## 🎯 Kullanım

### AI Query Assistant Kullanımı

1. Sağ taraftaki "AI Query Assistant" bölümünü aç
2. İstediğin arama sorgusunu doğal dil ile yaz
   - Örnek: "SWOT analizi hakkında kapsamlı bir sunum"
   - Örnek: "pazarlama stratejisi site:harvard.edu"
3. "Generate Query" butonuna bas
4. AI sorguyu otomatik olarak işler ve query builder'a ekler

### Manuel Query Builder Kullanımı

1. Sol taraftaki query builder alanında arama terimleri ekle
2. Operatör kartlarından istediğini sürükle-bırak ile ekle
3. Manifesto mode'dan önceden tanımlanmış şablonları kullan
4. Live preview'da oluşan sorguyu kontrol et

### Desteklenen Operatörler

- **`exact_term`**: Tam eşleşme için tırnak içinde arama
- **`site:`**: Belirli bir site içinde arama
- **`intitle:`**: Başlık içinde arama
- **`-`**: Hariç tutma operatörü

## 🔧 Geliştirme

### Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── AIQueryGenerator.tsx
│   ├── QueryBuilder.tsx
│   ├── SearchPreview.tsx
│   └── ...
├── contexts/           # React context'leri
│   └── LocalizationContext.tsx
├── locales/            # Çoklu dil dosyaları
│   ├── data.ts
│   ├── manifestos.ts
│   └── ui.ts
├── App.tsx             # Ana uygulama bileşeni
├── types.ts            # TypeScript tipleri
└── ...
```

### Çeviri Desteği

Uygulama Türkçe ve İngilizce dillerini desteklemektedir. Yeni dil eklemek için:

1. `locales/` dizinine yeni dil dosyası ekle
2. `LocalizationContext.tsx`'e yeni dil ekle
3. `useLocalization` hook'unu kullanarak bileşenlerde çeviri yap

### Debug ve Hata Ayıklama

Uygulama geliştirme sırasında debug log'ları otomatik olarak konsola yazdırılır:

- **Original prompt**: Kullanıcının girdiği orijinal prompt
- **Processing**: Prompt'un nasıl işlendiği
- **AI response**: AI'dan gelen ham yanıt
- **Final search query**: Preview'da gösterilen son sorgu

## 🤖 AI Model Desteği

Uygulama OpenRouter API üzerinden çeşitli AI modellerini destekler:

- **Default**: `openai/gpt-oss-20b:free`
- **Diğer modeller**: Sağladığın API anahtarına göre kullanılabilir

Model seçimi için sağ taraftaki "Select AI Model" dropdown menüsünü kullanabilirsin.

## 📄 Lisans

Bu proje MIT lisansı ile dağıtılmaktadır.

## 🤝 Katkı

Katkılarınızı memnuniyetle karşılarım. Lütfen:

1. Bu repoyu fork'layın
2. Özellik dalınızı oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit'leyin (`git commit -m 'Add some AmazingFeature'`)
4. Dala push'layın (`git push origin feature/AmazingFeature`)
5. Pull request oluşturun

## 📞 İletişim

Sorularınız veya önerileriniz için:
- GitHub Issues üzerinden iletişime geçin [GitHub Issues](https://github.com/cenktekin/smart-search-operator-page/issues)
- E-posta: [cenktekin@duck.com](mailto:cenktekin@duck.com)

## ☕ Buy Me a Coffee

Projeyi beğendiyseniz ve destek olmak isterseniz, bir kahve ısmarlayabilirsiniz! 😊

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/cenktekin)

## 🔒 Maintenance Notes

- **Security Cleanup**: Hassas dosyalar (.env.local, metadata.json) archive/ dizinine taşındı
- **Gitignore Update**: Archive dizini, log dosyaları ve temp dosyalar .gitignore'a eklendi
- **Security Audit**: Kod tabanında hassas bilgi taraması yapıldı, API key'ler environment variables ile yönetiliyor
- **Initial Commit**: chore(repo): initial commit with cleanup and security fixes
- **Push Status**: Main branch'e başarıyla push edildi, origin main tracking set edildi


# Sorun Giderme Kılavuzu

Bu doküman Smart Search Operator Page projesinde karşılaşabileceğiniz yaygın sorunların çözümlerini içerir.

## 🚨 Yaygın Sorunlar ve Çözümleri

### 1. AI Sorgusu Boş Geliyor

**Sorun**: AI Query Assistant'a metin yazdığınızda boş veya hatalı yanıt geliyor.

**Nedenleri**:
- OpenRouter API anahtarı geçersiz
- API limiti aşıldı
- Network bağlantı sorunu
- AI modeli meşgul

**Çözümler**:

1. **API Anahtarını Kontrol Et**:
   ```bash
   # .env.local dosyasını kontrol et
   VITE_OPENROUTER_API_KEY=your_api_key_here
   ```

2. **API Limitini Kontrol Et**:
   - [OpenRouter Dashboard](https://openrouter.ai/keys) üzerinden limitleri kontrol et
   - Kullanım limitlerine ulaşmadığından emin ol

3. **Network Bağlantısını Test Et**:
   ```bash
   curl -I https://openrouter.ai/api/v1/models
   ```

4. **Farklı Model Dene**:
   ```typescript
   // App.tsx içinde
   setSelectedModel("anthropic/claude-3-haiku:free");
   ```

### 2. JSON Parse Hatası

**Sorun**: AI yanıtı JSON olarak parse edilemiyor.

**Hata Mesajı**:
```
JSON.parse: unexpected end of data
```

**Çözüm**:
Uygulamada zaten gelişmiş error handling mekanizması var:

```typescript
try {
  const parsed = JSON.parse(responseText);
  if (Array.isArray(parsed)) {
    generatedParts = parsed;
  } else {
    // JSON'u metinden çıkar
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      generatedParts = JSON.parse(jsonMatch[0]);
    }
  }
} catch (parseError) {
  // Fallback: orijinal prompt'u kullan
  generatedParts = [{ type: 'text', value: prompt }];
}
```

### 3. Operatör Eşleşme Sorunu

**Sorun**: AI tarafından dönen operatör ID'si bulunamıyor.

**Nedenleri**:
- Operatör listesi güncel değil
- AI yanlış operatör ID'si döndürüyor
- Localization sorunu

**Çözümler**:

1. **Operatör Listesini Kontrol Et**:
   ```typescript
   console.log("Available operators:", OPERATORS);
   ```

2. **AI Response'u Kontrol Et**:
   ```typescript
   console.log("🔍 [DEBUG] AI response parts:", generatedParts);
   console.log("🔍 [DEBUG] Operator not found for ID:", part.operatorId);
   ```

3. **Fallback Mekanizması**:
   ```typescript
   if (operator) {
     // Operatör bulundu
   } else {
     // Fallback: text olarak kullan
     return {
       id: `ai-text-${index}-${Date.now()}`,
       type: 'text',
       value: part.value,
     };
   }
   ```

### 4. Timeout Hatası

**Sorun**: AI sorgusu 30 saniye içinde tamamlanamıyor.

**Hata Mesajı**:
```
Timeout after 3 retries: 30000ms timeout exceeded.
```

**Çözümler**:

1. **Daha Hızlı Model Seç**:
   ```typescript
   setSelectedModel("openai/gpt-oss-20b:free"); // Daha hızlı model
   ```

2. **Prompt'u Kısalt**:
   - Kullanıcı prompt'unu daha kısa yap
   - Gereksiz detayları kaldır

3. **Timeout Süresini Artır**:
   ```typescript
   // App.tsx içinde
   const timeoutMs = url.includes('/chat/completions') ? 60000 : 20000;
   ```

### 5. UI Render Sorunu

**Sorun**: Query builder veya preview'da render sorunu var.

**Nedenleri**:
- State management sorunu
- React lifecycle hatası
- CSS styling sorunu

**Çözümler**:

1. **State'i Kontrol Et**:
   ```typescript
   console.log("🔍 [DEBUG] Query parts:", queryParts);
   console.log("🔍 [DEBUG] Search query:", searchQuery);
   ```

2. **React Developer Tools Kullan**:
   - React Developer Tools eklentisini yükle
   - Component state'lerini kontrol et

3. **CSS Class'larını Kontrol Et**:
   ```css
   /* Tailwind class'larının doğru uygulandığından emin ol */
   .bg-kde-panel-light {
     background-color: #ffffff;
   }
   ```

## 🔧 Debug ve Loglama

### Debug Logları Aktif Etme

Uygulama zaten detaylı debug log'ları içerir:

```typescript
// Konsolda bu logları göreceksiniz:
console.log("🔍 [DEBUG] Original prompt:", prompt);
console.log("🔍 [DEBUG] Processing prompt:", remainingPrompt);
console.log("🔍 [DEBUG] AI response text:", responseText);
console.log("🔍 [DEBUG] Parsed AI response parts:", generatedParts);
console.log("🔍 [DEBUG] Final query parts:", newQueryParts);
console.log("🔍 [DEBUG] Generated search query:", query);
```

### Konsol Açma

1. **Chrome/Firefox**: F12 veya Ctrl+Shift+I
2. **Sekme**: Console sekmesini seç
3. **Logları Filtrele**: `🔍 [DEBUG]` ile filtrele

### Performance Monitoring

```typescript
// Performance ölçümü
const startTime = performance.now();
// AI sorgusu
const endTime = performance.now();
console.log(`AI query generation took ${endTime - startTime}ms`);
```

## 🌍 Localization Sorunları

### Çeviri Sorunları

**Sorun**: Bazı metinler çevirilmemiş veya hatalı.

**Çözümler**:

1. **Çeviri Dosyalarını Kontrol Et**:
   ```typescript
   // locales/ui.ts
   export const ui = {
     tr: {
       aiQueryAssistant: "AI Sorgu Yardımcısı",
       // diğer çeviriler
     },
     en: {
       aiQueryAssistant: "AI Query Assistant",
       // diğer çeviriler
     }
   };
   ```

2. **Dil Değiştirme**:
   ```typescript
   const { t, setLanguage } = useLocalization();
   setLanguage('en'); // İngilizce
   setLanguage('tr'); // Türkçe
   ```

### Operatör Çevirileri

```typescript
// locales/data.ts
export const operators = {
  tr: [
    {
      id: 'exact_term',
      operator: 'exact_term',
      description: 'Tam eşleşme için',
      example: '"marketing stratejisi"',
      category: 'general',
      takesValue: true
    }
  ],
  en: [
    {
      id: 'exact_term',
      operator: 'exact_term',
      description: 'For exact match',
      example: '"marketing strategy"',
      category: 'general',
      takesValue: true
    }
  ]
};
```

## 🚀 Deployment Sorunları

### Build Hataları

**Sorun**: `npm run build` komutu hata veriyor.

**Çözümler**:

1. **Bağımlılıkları Güncelle**:
   ```bash
   npm install
   npm update
   ```

2. **Cache'i Temizle**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **TypeScript Hataları**:
   ```bash
   npm run lint
   npm run lint:fix
   ```

### Environment Variables

**Sorun**: `.env.local` dosyası çalışmıyor.

**Çözümler**:

1. **Dosya Adını Kontrol Et**:
   - `.env.local` (nokta ile başlamalı)
   - `.env.example` dosyasını kopyala

2. **Değişken Adını Kontrol Et**:
   ```bash
   # Doğru:
   VITE_OPENROUTER_API_KEY=your_key
   
   # Yanlış:
   OPENROUTER_API_KEY=your_key
   ```

3. **Restart Et**:
   ```bash
   npm run dev
   ```

## 📊 Performance Sorunları

### Yavaş Yükleme

**Sorun**: Uygulama yükleniyor.

**Çözümler**:

1. **Bundle Analizi**:
   ```bash
   npm run build:analyze
   ```

2. **Code Splitting**:
   ```typescript
   // Lazy loading
   const AIQueryGenerator = React.lazy(() => import('./components/AIQueryGenerator'));
   ```

3. **Image Optimizasyonu**:
   ```bash
   npm install sharp
   ```

### Memory Leak

**Sorun**: Uygulama açık kaldıkça bellek kullanımı artıyor.

**Çözümler**:

1. **Event Listener'ları Temizle**:
   ```typescript
   useEffect(() => {
     const handler = () => { /* ... */ };
     window.addEventListener('resize', handler);
     return () => window.removeEventListener('resize', handler);
   }, []);
   ```

2. **State'i Temizle**:
   ```typescript
   useEffect(() => {
     return () => {
       setQueryParts([]);
       setSelectedManifesto(null);
     };
   }, []);
   ```

## 🔒 Güvenlik Sorunları

### XSS Koruması

**Sorun**: Kullanıcı girdileri güvenli değil.

**Çözümler**:

1. **Input Validation**:
   ```typescript
   const sanitizeInput = (input: string) => {
     return input.replace(/[<>]/g, '');
   };
   ```

2. **React'in Built-in Koruması**:
   - React otomatik olarak XSS koruması sağlar
   - `dangerouslySetInnerHTML` kullanmaktan kaçın

### API Güvenliği

**Sorun**: API anahtarı tarayıcıda görünüyor.

**Çözümler**:

1. **Environment Variables**:
   - API anahtarları `.env.local` dosyasında saklanır
   - Build sırasında inject edilir

2. **Rate Limiting**:
   - OpenRouter API kendi rate limiting'e sahiptir
   - Kısa sürede çok fazla istek göndermeyi önle

## 📞 Destek İletişimi

### GitHub Issues

Sorunları GitHub Issues üzerinden bildirebilirsiniz:

1. **Issue Oluşturma**:
   - Repository'ye git
   - "Issues" sekmesine tıkla
   - "New Issue" butonuna bas

2. **Issue Formatı**:
   ```markdown
   ## Sorun Başlığı
   Sorunun detaylı açıklaması
   
   ### Adımlar
   1. Adım 1
   2. Adım 2
   
   ### Beklenen Sonuç
   Ne olmasını bekliyorsunuz?
   
   ### Gerçek Sonuç
   Ne oluyor?
   
   ### Hata Mesajı
   ```error
   Hata mesajı buraya
   ```
   ```

### Debug Bilgileri

Issue açarken aşağıdaki bilgileri ekleyin:

1. **Sistem Bilgileri**:
   - İşletim sistemi
   - Tarayıcı ve versiyon
   - Node.js versiyonu

2. **Uygulama Bilgileri**:
   - Uygulama versiyonu
   - Kullanılan AI modeli
   - OpenRouter API durumu

3. **Debug Logları**:
   - Konsol log'ları
   - Network request'leri

## 🔄 Çözülen Sorunlar

### v1.0.0 - AI Response Boş Geliyordu

**Sorun**: AI Query Assistant'a metin yazdığında boş yanıt geliyordu.

**Çözüm**: System instruction ve JSON formatı optimize edildi.

```typescript
// Önceki versyon
const systemInstruction = `You are an expert search query assistant...`;

// Yeni versyon
const systemInstruction = `You are an expert search query assistant. INSTRUCTIONS:
1. Analyze the user's request and break it down into meaningful search terms
2. Use the available operators to create an effective search query
3. Return ONLY a valid JSON array - no explanations, no additional text
4. Do NOT repeat the user's request verbatim`;
```

### v0.9.0 - JSON Parse Hatası

**Sorun**: AI yanıtı JSON olarak parse edilemiyordu.

**Çözüm**: Gelişmiş error handling ve fallback mekanizması eklendi.

```typescript
try {
  const parsed = JSON.parse(responseText);
  if (Array.isArray(parsed)) {
    generatedParts = parsed;
  } else {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      generatedParts = JSON.parse(jsonMatch[0]);
    }
  }
} catch (parseError) {
  generatedParts = [{ type: 'text', value: prompt }];
}
```

---

Bu doküman projenin sorun giderme sürecinde size yardımcı olacaktır. Daha fazla bilgi için GitHub Issues üzerinden iletişime geçebilirsiniz.
# Geliştirme Kılavuzu

Bu doküman Smart Search Operator Page projesinin geliştiricileri için teknik detayları içerir.

## 🏗️ Mimari

### Genel Mimari

```
Smart Search Operator Page
├── Frontend (React + TypeScript + Vite)
├── AI Integration (OpenRouter API)
├── State Management (React Hooks)
└── Localization (i18n)
```

### Bileşen Mimarisi

```
App.tsx (Ana Uygulama)
├── Header (Başlık ve Tema Değiştirici)
├── QueryBuilder (Sorgu Oluşturucu)
│   └── QueryPartTag (Sorgu Parçası Etiketi)
├── SearchPreview (Canlı Önizleme)
├── AIQueryGenerator (AI Sorgu Üretici)
├── ManifestoModeSelector (Manifesto Modu Seçici)
├── CategoryFilter (Kategori Filtresi)
└── OperatorCard (Operatör Kartı)
```

## 🔧 Kurulum ve Geliştirme Ortamı

### Geliştirme Ortamı Kurulumu

```bash
# 1. Repository klonlama
git clone <repository-url>
cd smart-search-operator-page

# 2. Bağımlılıkları yükleme
npm install

# 3. Ortam değişkenlerini ayarlama
cp .env.example .env.local
# .env.local dosyasına VITE_OPENROUTER_API_KEY ekleyin

# 4. Geliştirme sunucusunu başlatma
npm run dev
```

### Kod Düzeni

#### TypeScript Kullanımı

Proje TypeScript ile yazılmıştır ve tip güvenliği sağlar:

```typescript
interface QueryPart {
  id: string;
  type: 'operator' | 'text';
  value: string;
  operator?: SearchOperator;
  isManifestoPart?: boolean;
}
```

#### Bileşen Yapısı

Her bileşen şu yapıya sahiptir:

```typescript
interface ComponentProps {
  // Props tanımları
}

export const Component: React.FC<ComponentProps> = ({ props }) => {
  // Bileşen mantığı
  return (
    // JSX
  );
};
```

## 🤖 AI Entegrasyonu

### OpenRouter API Kullanımı

AI sorguları OpenRouter API üzerinden işlenir:

```typescript
const handleGenerateAIQuery = async (prompt: string) => {
  const systemInstruction = `AI sistem talimatları...`;
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: fullPrompt }
      ],
      response_format: { type: "json_object" },
    }),
  });
};
```

### System Instruction Optimizasyonu

AI'nın doğru çalışması için system instruction kritik öneme sahiptir:

```typescript
const systemInstruction = `You are an expert search query assistant. Your task is to convert a user's request into a structured Google search query.

INSTRUCTIONS:
1. Analyze the user's request and break it down into meaningful search terms
2. Use the available operators to create an effective search query
3. Return ONLY a valid JSON array - no explanations, no additional text
4. Do NOT repeat the user's request verbatim

JSON SCHEMA:
[
  {
    "type": "text" | "operator",
    "value": "string",
    "operatorId": "string (only for operator type)"
  }
]`;
```

## 🌍 Localization (Çoklu Dil Desteği)

### Yapı

```typescript
// contexts/LocalizationContext.tsx
export const useLocalization = () => {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  
  return {
    t: translations[language],
    OPERATORS: operators[language],
    OPERATOR_CATEGORIES: categories[language],
    setLanguage,
  };
};
```

### Yeni Dil Ekleme

1. `locales/ui.ts` dosyasına yeni çevirileri ekle
2. `locales/data.ts` dosyasına yeni operatör çevirilerini ekle
3. `LocalizationContext.tsx`'e yeni dil desteğini ekle

```typescript
// Örnek: Yeni dil ekleme
const languages = {
  tr: { /* Türkçe çeviriler */ },
  en: { /* İngilizce çeviriler */ },
  de: { /* Almanca çeviriler */ }, // Yeni dil
} as const;
```

## 🎨 Styling ve Tema

### Tailwind CSS Kullanımı

Proje Tailwind CSS ile stilendirilmiştir:

```css
/* Tema değişkenleri */
:root {
  --kde-accent: #007bff;
  --kde-bg-light: #ffffff;
  --kde-bg-dark: #1a1a1a;
  --kde-text-light: #333333;
  --kde-text-dark: #ffffff;
  --kde-border-light: #e0e0e0;
  --kde-border-dark: #404040;
}
```

### Dark Mode Desteği

```typescript
// App.tsx
const [theme, setTheme] = useState<'light' | 'dark'>('light');

useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]);
```

## 🐛 Debug ve Hata Ayıklama

### Debug Logları

Uygulama geliştirme sırasında detaylı loglar üretir:

```typescript
console.log("🔍 [DEBUG] Original prompt:", prompt);
console.log("🔍 [DEBUG] Processing prompt:", remainingPrompt);
console.log("🔍 [DEBUG] AI response text:", responseText);
console.log("🔍 [DEBUG] Final search query:", query);
```

### Hata Yönetimi

```typescript
try {
  // AI sorgusu
} catch (error) {
  if (error.message.includes('Timeout')) {
    setAiError('Timeout: AI sorgu üretimi 30 saniye içinde tamamlanamadı.');
  } else {
    console.error("AI query generation failed:", error);
    setAiError(t.aiErrorBody);
  }
}
```

## 📊 Performans Optimizasyonu

### React.memo Kullanımı

Bileşenlerin gereksiz yeniden render'larını önlemek için:

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  return (
    // JSX
  );
});
```

### useMemo ve useCallback

Hesaplama maliyetli işlemleri optimize etmek için:

```typescript
const filteredOperators = useMemo(() => {
  return OPERATORS.filter(op => op.category === activeCategory);
}, [activeCategory, OPERATORS]);

const handleGenerateAIQuery = useCallback(async (prompt: string) => {
  // Fonksiyon mantığı
}, [OPERATORS, t.aiErrorBody, selectedModel]);
```

## 🧪 Test

### Test Çalıştırma

```bash
# Unit testler
npm test

# Test coverage
npm run test:coverage

# E2E testler
npm run test:e2e
```

### Test Stratejisi

1. **Unit Testler**: Bileşen ve fonksiyonların tek tek test edilmesi
2. **Integration Testler**: Bileşenler arası etkileşimlerin test edilmesi
3. **E2E Testler**: Kullanıcı senaryolarının uçtan uca test edilmesi

## 🚀 Deployment

### Build Etme

```bash
# Production build
npm run build

# Build dosyalarını kontrol etme
npm run build:analyze
```

### Deployment Adımları

1. **GitHub Pages**:
   ```bash
   npm run deploy:gh-pages
   ```

2. **Vercel**:
   ```bash
   npm run deploy:vercel
   ```

3. **Netlify**:
   ```bash
   npm run deploy:netlify
   ```

## 🔒 Güvenlik

### API Anahtarları

- API anahtarları `.env.local` dosyasında saklanır
- `.gitignore` dosyasına eklenerek repository'e eklenmez
- Tarayıcı tarafında güvenli bir şekilde kullanılır

### XSS Koruması

- Kullanıcı girdileri güvenli bir şekilde işlenir
- HTML injection önlenir
- React'in built-in XSS koruması kullanılır

## 📝 Kod Standartları

### ESLint ve Prettier

```bash
# Kod kalitesini kontrol etme
npm run lint

# Kodu otomatik formatlama
npm run format

# Fixable sorunları otomatik düzeltme
npm run lint:fix
```

### Commit Mesajları

```
type(scope): description

Örnek:
feat(ai): add GPT-4 model support
fix(query): resolve operator mapping issue
docs(readme): update installation guide
style(components): improve button styling
test(ai): add unit tests for query generation
```

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run build
```

## 📚 Ek Kaynaklar

### Dokümantasyon

- [React Dokümantasyonu](https://react.dev/)
- [TypeScript Dokümantasyonu](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Dokümantasyonu](https://tailwindcss.com/docs)
- [OpenRouter API Dokümantasyonu](https://openrouter.ai/docs)

### Araçlar

- **VS Code**: Kod editörü
- **ESLint**: Kod kalitesi kontrolü
- **Prettier**: Kod formatlama
- **React Developer Tools**: React debug araçları
- **Chrome DevTools**: Tarayıcı debug araçları

---

Bu doküman projenin geliştirilmesi sürecinde referans olarak kullanılabilir. Sorularınız için GitHub Issues üzerinden iletişime geçebilirsiniz.
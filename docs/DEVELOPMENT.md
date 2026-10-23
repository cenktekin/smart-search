# Geliştirme Kılavuzu

## Mimari

```
App.tsx                     uygulama kabuğu, sorgu durumu, tema
├── components/             sunum bileşenleri (props ile beslenir)
├── hooks/useAIQuery.ts     model listesi + AI isteği + hata durumu
├── lib/ai.ts               sistem talimatı, yanıt ayrıştırma
├── lib/http.ts             zaman aşımlı, yeniden denemeli fetch
├── lib/query.ts            sorgu metni, ?q= paylaşımı
├── contexts/               dil ve operatör seçimi
└── locales/                EN/TR metinler, operatörler, manifestolar
```

Durum yönetimi React Hook'larıdır (Redux/Zustand yok). Bileşenler `props` ile beslenir; yalnızca dil/operatörler context üzerinden gelir.

## Geliştirme akışı

```bash
npm install
Copy-Item .env.example .env.local     # bash: cp .env.example .env.local
npm run dev
```

Kapılar (commit öncesi):

```bash
npm run typecheck
npm run build
```

Otomatik test, lint ve biçimlendirme **yoktur**; bunlar planlanan işlerdir (aşağıya bakın). `npm test` / `npm run lint` komutları bu depoda tanımlı değildir.

## Kod düzeni

- Bileşenler fonksiyonel ve tiplidir:

```tsx
interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export const Component: React.FC<ComponentProps> = ({ value, onChange }) => { ... };
```

- Saf yardımcılar `lib/` altında tutulur; böylece test edilebilirler (`buildSearchQuery`, `parseAIResponse`, `buildSystemInstruction`).
- Yeni operatör eklemek: `locales/data.ts` içine hem `OPERATORS_EN` hem `OPERATORS_TR` kaydı ekle. AI sistem talimatı kataloğu bu dosyadan üretildiği için ek kod gerekmez.

## Localization

`contexts/LocalizationContext.tsx` aktif dili ve o dile ait metin/operatör setini sağlar:

```tsx
const { language, toggleLanguage, t, OPERATORS, OPERATOR_CATEGORIES } = useLocalization();
```

- Arayüz metinleri: `locales/ui.ts` (`UiStrings` tipi zorunlu alanları dayatır)
- Operatörler: `locales/data.ts`
- Manifestolar: `locales/manifestos.ts`

Yeni dil eklemek için üç dosyada da karşılık gelen setleri tanımlayıp `LocalizationContext` içindeki seçimi genişletmek gerekir.

## Stil

- Tailwind CSS `index.html` içinde CDN'den yüklenir; `tailwind.config` aynı dosyada tanımlıdır (`kde-*` renkleri, `darkMode: 'class'`).
- Koyu tema `document.documentElement` üzerine `dark` sınıfı eklenerek uygulanır.
- Global temel stiller `index.css` içindedir.

## Sorgu paylaşımı

`lib/query.ts`:

- `writeSharedQuery(query)` — sorguyu `?q=` olarak `history.replaceState` ile yazar
- `readSharedQuery()` — açılışta `?q=` varsa onu başlangıç sorgusu yapar (localStorage'dan önce gelir)

## Deployment

Build çıktısı `dist/` altındadır ve statik olarak servis edilebilir:

```bash
npm run build
npm run preview
```

Depoda tanımlı bir CI workflow'u, deploy scripti veya alan adı yapılandırması yoktur.

## PLANLANAN

- `tsconfig` içinde `strict: true` ve build öncesi `tsc`
- Vitest ile `lib/` fonksiyonlarının birim testleri (ağ çağrısı yok)
- Tailwind CDN yerine derlenmiş CSS
- `App.tsx`'in büyümesi durumunda ek bileşen/hook ayrımı
- İstemci anahtarı için sunucu tarafı proxy

# Tasks — Smart Search Operator Page

Son güncelleme: 2026-10-23

## Durum

- **Aşama:** Çalışır durumda; AI akışı, varlıklar ve dokümanlar hizalandı
- **Stack:** React 19 + TypeScript 5.8 + Vite 6, Tailwind (CDN), OpenRouter
- **Kapılar:** `npm run typecheck` ✅ · `npm run build` ✅ (224,8 kB / 69,6 kB gzip)

## Tamamlanan

- [x] AI isteği/yanıt şeması uyumu (`response_format: json_object` ↔ `{"parts":[...]}`)
- [x] Sistem talimatının operatör kataloğundan üretilmesi (`filetype`, `inurl`, `related`, `cache`, `define`)
- [x] Debug log temizliği, ölü Gemini/importmap config'i, boş `constants.ts`
- [x] Eksik varlıklar: `index.css`, `public/favicon.svg`
- [x] `?q=` ile paylaşılabilir bağlantı
- [x] Paket yöneticisi tekilleştirme (npm), `.gitattributes`, `.env.example`, `LICENSE`
- [x] `App.tsx` 579 → 316 satır (`hooks/` + `lib/` ayrımı)
- [x] README ve `docs/` gerçek davranışa göre yeniden yazıldı
- [x] Footer'daki hatalı repo bağlantısı düzeltildi (`cenktekin/smart-search`)
- [x] `npm run typecheck` script'i ve `vite/client` tipleri

## Sıradaki işler

### P1 — Test ve CI

- [ ] Vitest kurulumu; ağ çağrısı olmayan birim testleri: `buildSearchQuery`, `parseAIResponse`, `buildSystemInstruction`, `readSharedQuery`
- [ ] GitHub Actions: `npm ci --include=dev` → `typecheck` → `build` → `test`

### P1 — Tip güvenliği

- [ ] `tsconfig` içinde `strict: true`, kalan `any` kullanımlarını temizle
- [ ] `build` öncesi `tsc --noEmit` (şimdilik ayrı script)

### P2 — Üretim dayanıklılığı

- [ ] Tailwind CDN → derlenmiş CSS (offline/üretim kırılganlığı)
- [ ] İstemci anahtarı için sunucu tarafı proxy (şu an anahtar pakette görünür)

### P3 — Özellik

- [ ] Sorgu geçmişi (localStorage + geçmiş paneli)
- [ ] AI ile mevcut sorguyu iyileştirme önerisi
- [ ] `manifestos.ts` yalnız 2 şablon içeriyor; genişletme değerlendirmesi

## Bilinen sınırlar

- API anahtarı istemci paketine gömülür; yalnız kişisel/yerel kullanım için uygun
- Otomatik test ve CI yok
- `docs/` ve `README` dışında sürüm/changelog takibi yok

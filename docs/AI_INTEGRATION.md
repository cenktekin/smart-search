# AI Entegrasyonu

Bu doküman AI Query Assistant'ın gerçekte nasıl çalıştığını anlatır. Uygulanmamış fikirler açıkça "PLANLANAN" olarak işaretlidir.

## Akış

```
Kullanıcı isteği
  → buildUserPrompt()            (lib/ai.ts)
  → OpenRouter /chat/completions (hooks/useAIQuery.ts, lib/http.ts)
  → parseAIResponse()            (lib/ai.ts)
  → QueryPart[] → Query Builder  (App.tsx)
```

## İstek

`POST https://openrouter.ai/api/v1/chat/completions`

```json
{
  "model": "openai/gpt-oss-20b:free",
  "messages": [
    { "role": "system", "content": "<operatör kataloğu + kurallar>" },
    { "role": "user", "content": "User request: \"...\"" }
  ],
  "response_format": { "type": "json_object" }
}
```

- `Authorization: Bearer $VITE_OPENROUTER_API_KEY`
- Zaman aşımı: sohbet isteklerinde 30 sn, diğer isteklerde 10 sn
- Yeniden deneme: 3 deneme, üstel geri çekilme (1 sn, 2 sn, 4 sn)
- 4xx yanıtları yeniden denenmez; 5xx ve ağ hataları denenir

## Sistem talimatı

`buildSystemInstruction(operators)` talimatı operatör kataloğundan **dinamik olarak** üretir; böylece `locales/data.ts`'e operatör eklendiğinde modele de otomatik yansır.

Modelden istenen biçim:

```json
{
  "parts": [
    { "type": "text", "value": "pestle analysis" },
    { "type": "operator", "value": "pdf", "operatorId": "filetype" },
    { "type": "operator", "value": "harvard.edu", "operatorId": "site" }
  ]
}
```

Kurallar:

- Her terim bir `text` parçası
- Dosya türü → `filetype`, alan adı → `site`, başlık → `intitle`, URL → `inurl`, benzer site → `related`, tanım → `define`, tam ifade → `exact_term`, hariç tutma → `exclude`, alternatif → `or`
- `value` yalnızca operand içerir (operatör öneki, tırnak, eksi işareti yok)
- Katalogda olmayan `operatorId` üretilmez
- Metin değerleri kullanıcının dilinde bırakılır

## Yanıt ayrıştırma

`parseAIResponse(responseText, operators, fallbackText)` şu sırayı dener:

1. Kod bloğu işaretleri (```` ```json ````) temizlenir
2. Doğrudan `JSON.parse` → dizi ya da `parts` alanı olan nesne
3. Metin içindeki `[...]` dilimi
4. Metin içindeki `{...}` dilimi
5. Hiçbiri olmazsa istek metni tek `text` parçası olarak döner

Parça doğrulama:

- `value` boş veya metin değilse istek metni kullanılır
- `operatorId` katalogda yoksa parça `text`'e düşer
- `type === "operator"` olsa bile değer boşsa `text` üretilir

## Model listesi

Anahtar varsa `GET /models` çağrılır, dönen liste model seçicisini doldurur. Liste alınamazsa varsayılan model (`openai/gpt-oss-20b:free`) tek seçenek olarak gösterilir.

## Hata durumları

| Durum | Kullanıcıya gösterilen |
|---|---|
| Anahtar yok | "OpenRouter API anahtarı tanımlı değil..." |
| 30 sn zaman aşımı (`TimeoutError`) | "İstek 30 saniye içinde tamamlanamadı..." |
| Diğer hatalar | Genel AI hatası metni |

Teknik ayrıntı konsola `console.error` ile yazılır; istek/yanıt içeriği loglanmaz.

## PLANLANAN (uygulanmadı)

Aşağıdakiler bu projede **yoktur**; dokümanın eski sürümünde varmış gibi anlatılıyordu:

- **Yanıt önbelleği** — aynı istek için bellek içi cache
- **Debounce** — yazarken otomatik istek atma (istek yalnızca butonla gider)
- **Girdi temizleme (`sanitizeInput`)** — React metni zaten kaçışlar; ayrı bir sanitizer yok
- **Model fine-tuning / streaming / paralel sorgulama**

## Güvenlik

API anahtarı istemci paketine gömülür (`VITE_` öneki). Bu, anahtarın tarayıcıdan okunabileceği anlamına gelir; "güvenlik riski minimal" değildir. Kabul edilebilir olduğu tek senaryo, anahtarın yalnızca sizin kullandığınız yerel/kişisel kurulumda bulunmasıdır. Herkese açık bir dağıtım için sunucu tarafı proxy ve kısıtlı anahtar gerekir.

XSS tarafında ek önlem yoktur; proje `dangerouslySetInnerHTML` kullanmaz ve tüm metin React tarafından kaçışlanır.

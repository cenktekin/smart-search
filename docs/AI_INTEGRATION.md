# AI Entegrasyonu Dokümantasyonu

Bu doküman Smart Search Operator Page projesindeki AI entegrasyonunun teknik detaylarını içerir.

## 🤖 AI Mimarisi

### Genel Akış

```
Kullanıcı Input → Prompt Processing → AI API → Response Parsing → Query Generation → UI Update
```

### AI Entegrasyon Bileşenleri

1. **AIQueryGenerator**: Kullanıcı arayüzü bileşeni
2. **handleGenerateAIQuery**: AI sorgusu işleyici fonksiyon
3. **System Instruction**: AI talimatları
4. **Response Parser**: AI yanıtını işleyici
5. **Query Builder**: Oluşturulan sorguyu UI'ya ekleyici

## 🔧 System Instruction Optimizasyonu

### Önceki Versiyon Sorunları

Eski system instruction çok genel ve yetersizdi:

```typescript
// Eski versyon - sorunlu
const systemInstruction = `You are an expert search query assistant. Your task is to convert a user's request into a structured Google search query.
- The user's request is provided as a JSON array of objects...
- You MUST use the available operators...
- You MUST return the result as a JSON array...`;
```

### Yeni Versiyon İyileştirmeleri

Geliştirilen yeni system instruction:

```typescript
// Yeni versyon - optimize edilmiş
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
]

RULES:
- For text parts: type "text", value contains the search term
- For operators: type "operator", value contains the parameter, operatorId matches available operator
- Use exact_term operator for phrases that should be searched exactly
- Use exclude operator to exclude specific terms
- Use intitle: operator to search within titles
- Use site: operator to search within specific sites
- Combine terms logically with AND (implicit) or explicit operators

EXAMPLE:
User request: "SWOT analysis presentation template"
Response: [
  {"type": "text", "value": "SWOT analysis"},
  {"type": "text", "value": "presentation"},
  {"type": "text", "value": "template"}
]

User request: "marketing site:harvard.edu"
Response: [
  {"type": "text", "value": "marketing"},
  {"type": "operator", "value": "harvard.edu", "operatorId": "site"}
]`;
```

### İyileştirmeler

1. **Net Talimatlar**: AI'ın ne yapması gerektiği açıkça belirtildi
2. **JSON Schema**: Beklenen çıktı formatı netleştirildi
3. **Örnekler**: Gerçek kullanım senaryoları eklendi
4. **Kurallar**: Operatör kullanım kuralları açıklandı
5. **Yasaklamalar**: "Sadece JSON döndür" talimatı eklendi

## 📊 Prompt Engineering

### Prompt Formatı

```typescript
const fullPrompt = `Convert this user request into a structured Google search query using the available operators:

User request: "${prompt}"

Available operators: ${JSON.stringify(availableOperators, null, 2)}

Return ONLY a valid JSON array with no additional text or explanations.`;
```

### Prompt Optimizasyonu

1. **Kullanıcı Request'i**: Net bir şekilde iletilir
2. **Available Operators**: Formatlı bir şekilde gösterilir
3. **Talimatlar**: Açık ve net talimatlar verilir
4. **Örnekler**: JSON formatı örneklerle gösterilir

## 🔍 Response Parsing ve Error Handling

### JSON Parse Hatası Yönetimi

```typescript
let generatedParts: AIResponsePart[] = [];
try {
  // Try to parse as JSON array first
  const parsed = JSON.parse(responseText);
  if (Array.isArray(parsed)) {
    generatedParts = parsed;
  } else {
    // If not an array, try to extract JSON from text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      generatedParts = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No valid JSON found in response');
    }
  }
} catch (parseError) {
  console.error("🔍 [DEBUG] JSON parse error:", parseError);
  // Fallback: create text part from original prompt
  generatedParts = [{ type: 'text', value: prompt }];
}
```

### Response Validation

```typescript
const newQueryParts: QueryPart[] = generatedParts.map((part, index) => {
  // Validate part structure
  if (!part.type || !part.value) {
    console.log("🔍 [DEBUG] Invalid part structure, fallback to text:", part);
    return {
      id: `ai-fallback-${index}-${Date.now()}`,
      type: 'text',
      value: prompt, // Use original prompt as fallback
    };
  }

  if (part.type === 'operator' && part.operatorId) {
    const operator = OPERATORS.find(op => op.id === part.operatorId);
    if (operator) {
      return {
        id: `ai-op-${index}-${Date.now()}`,
        type: 'operator',
        operator,
        value: part.value,
      };
    } else {
      // Fallback to text if operator not found
      return {
        id: `ai-text-${index}-${Date.now()}`,
        type: 'text',
        value: part.value,
      };
    }
  }
  
  return {
    id: `ai-text-${index}-${Date.now()}`,
    type: 'text',
    value: part.value,
  };
});
```

## 🚀 AI Model Desteği

### Desteklenen Modeller

```typescript
const [availableModels, setAvailableModels] = useState<any[]>([]);
const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-oss-20b:free");

// Model listesini çekme
const fetchModels = async () => {
  try {
    const response = await retryFetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      },
    }, 2, 500);
    const data = await response.json();
    setAvailableModels(data.data);
  } catch (error) {
    console.error("Error fetching models:", error);
  }
};
```

### Model Seçimi

Kullanıcılar farklı AI modelleri seçebilir:

- **Default**: `openai/gpt-oss-20b:free`
- **GPT-4**: `openai/gpt-4`
- **Claude**: `anthropic/claude-3-opus`
- **Diğer modeller**: OpenRouter API üzerinden erişilebilir

## 🛡️ Error Handling ve Retry Logic

### Retry Mekanizması

```typescript
const retryFetch = async (url: string, options: RequestInit, maxRetries: number, baseDelay: number) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutMs = url.includes('/chat/completions') ? 30000 : 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500 || response.status === 0) {
          if (attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`API error after ${maxRetries} retries: ${response.status} ${response.statusText}`);
        } else {
          throw new Error(`Client error: ${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`Timeout after ${maxRetries} retries: ${timeoutMs}ms timeout exceeded.`);
      } else if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
};
```

### Timeout Yönetimi

- **Chat Completions**: 30 saniye timeout
- **Diğer API'ler**: 10 saniye timeout
- **Retry Logic**: Üç deneme ile üstel geri dönüş

## 📈 Performans Optimizasyonu

### Caching

AI yanıtları cache'lenebilir:

```typescript
const aiResponseCache = new Map<string, AIResponsePart[]>();

const getCachedResponse = (prompt: string) => {
  const cacheKey = prompt.toLowerCase().trim();
  return aiResponseCache.get(cacheKey);
};

const setCachedResponse = (prompt: string, response: AIResponsePart[]) => {
  const cacheKey = prompt.toLowerCase().trim();
  aiResponseCache.set(cacheKey, response);
};
```

### Debouncing

Kullanıcı yazarken AI sorgusu göndermeyi önlemek için:

```typescript
const debouncedGenerate = useCallback(debounce(handleGenerateAIQuery, 500), []);
```

## 🔒 Güvenlik

### API Anahtarları

- API anahtarları `.env.local` dosyasında saklanır
- Tarayıcı tarafında güvenli bir şekilde kullanılır
- Server-side rendering olmadığı için güvenlik riski minimal

### XSS Koruması

Kullanıcı girdileri güvenli bir şekilde işlenir:

```typescript
const sanitizeInput = (input: string) => {
  return input.replace(/[<>]/g, '');
};
```

## 🧪 Test Senaryoları

### Başarılı Senaryolar

1. **Basit Arama**:
   - Input: "SWOT analizi"
   - Expected Output: `["SWOT analizi"]`

2. **Operatör Kullanımı**:
   - Input: "pazarlama site:harvard.edu"
   - Expected Output: `[{"type": "text", "value": "pazarlama"}, {"type": "operator", "value": "harvard.edu", "operatorId": "site"}]`

3. **Çoklu Terim**:
   - Input: "SWOT analizi sunum şablonu"
   - Expected Output: `[{"type": "text", "value": "SWOT analizi"}, {"type": "text", "value": "sunum"}, {"type": "text", "value": "şablonu"}]`

### Hata Senaryoları

1. **Boş Input**:
   - Input: ""
   - Expected Output: Error handling

2. **Geçersiz JSON**:
   - AI Response: "Invalid JSON"
   - Expected Output: Fallback to original prompt

3. **Bilinmeyen Operatör**:
   - AI Response: `{"type": "operator", "operatorId": "unknown_operator"}`
   - Expected Output: Fallback to text

## 📊 Monitoring ve Debug

### Debug Logları

```typescript
console.log("🔍 [DEBUG] Original prompt:", prompt);
console.log("🔍 [DEBUG] Processing prompt:", remainingPrompt);
console.log("🔍 [DEBUG] AI response text:", responseText);
console.log("🔍 [DEBUG] Parsed AI response parts:", generatedParts);
console.log("🔍 [DEBUG] Final query parts:", newQueryParts);
console.log("🔍 [DEBUG] Generated search query:", query);
```

### Performance Monitoring

```typescript
const startTime = performance.now();
// AI sorgusu
const endTime = performance.now();
console.log(`AI query generation took ${endTime - startTime}ms`);
```

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler

1. **Model Fine-tuning**: Özel modeller için fine-tuning desteği
2. **Response Caching**: Yanıt cache'leme sistemi
3. **Rate Limiting**: API rate limiting yönetimi
4. **Advanced Error Handling**: Detaylı hata mesajları
5. **Custom Prompts**: Kullanıcı özel system instruction'ları

### Performance İyileştirmeleri

1. **Parallel Processing**: Birden fazla AI modeli aynı anda sorgulama
2. **Streaming Responses**: Yanıtların streaming olarak gelmesi
3. **Compression**: API request/response compression
4. **CDN Integration**: Statik asset'ler için CDN desteği

---

Bu doküman AI entegrasyonunun teknik detaylarını içerir. Sorularınız için GitHub Issues üzerinden iletişime geçebilirsiniz.
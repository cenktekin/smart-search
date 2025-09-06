
export type UiStrings = {
  smartSearchBuilder: string;
  toggleTheme: string;
  toggleLanguage: string;
  queryBuilder: string;
  searchOnGoogle: string;
  reset: string;
  livePreview: string;
  queryPlaceholder: string;
  operatorLibrary: string;
  addToQuery: string;
  addTextPart: string;
  removePart: (part: string) => string;
  enterSearchTerm: string;
  searchManifesto: string;
  standardMode: string;
  manifestoScientificName: string;
  manifestoScientificDesc: string;
  manifestoEthicalName: string;
  manifestoEthicalDesc: string;
  aiQueryAssistant: string;
  aiPromptPlaceholder: string;
  generateQuery: string;
  generating: string;
  aiErrorTitle: string;
  aiErrorBody: string;
  selectAIModel: string;
};

export type UiStringKeys = {
  [K in keyof UiStrings]: UiStrings[K] extends string ? K : never
}[keyof UiStrings];

export const UI_STRINGS_EN: UiStrings = {
  smartSearchBuilder: "Smart Search Builder",
  toggleTheme: "Toggle theme",
  toggleLanguage: "Toggle language",
  queryBuilder: "Query Builder",
  searchOnGoogle: "Search on Google",
  reset: "Reset",
  livePreview: "Live Preview",
  queryPlaceholder: "Your query will appear here...",
  operatorLibrary: "Operator Library",
  addToQuery: "Add to Query",
  addTextPart: "Add text part",
  removePart: (part) => `Remove ${part}`,
  enterSearchTerm: "Enter search term...",
  searchManifesto: "Search Manifesto",
  standardMode: "Standard Mode",
  manifestoScientificName: "Scientific Priority",
  manifestoScientificDesc: "Prioritizes academic and official sources (.edu, .gov) and PDF files.",
  manifestoEthicalName: "Ethical & Focused",
  manifestoEthicalDesc: "Excludes major social media platforms to focus on direct sources.",
  aiQueryAssistant: "AI Query Assistant",
  aiPromptPlaceholder: "Describe the search you want to perform...\ne.g., 'a presentation or pdf document about PESTLE analysis'",
  generateQuery: "Generate Query",
  generating: "Generating...",
  aiErrorTitle: "AI Generation Failed",
  aiErrorBody: "The AI could not generate a query. Please try again or rephrase your request.",
  selectAIModel: "Select AI Model",
};

export const UI_STRINGS_TR: UiStrings = {
  smartSearchBuilder: "Akıllı Arama Oluşturucu",
  toggleTheme: "Temayı değiştir",
  toggleLanguage: "Dili değiştir",
  queryBuilder: "Sorgu Oluşturucu",
  searchOnGoogle: "Google'da Ara",
  reset: "Sıfırla",
  livePreview: "Canlı Önizleme",
  queryPlaceholder: "Sorgunuz burada görünecek...",
  operatorLibrary: "Operatör Kütüphanesi",
  addToQuery: "Sorguya Ekle",
  addTextPart: "Metin bölümü ekle",
  removePart: (part) => `${part} parçasını kaldır`,
  enterSearchTerm: "Arama terimi girin...",
  searchManifesto: "Arama Manifestosu",
  standardMode: "Standart Mod",
  manifestoScientificName: "Bilimsel Öncelik",
  manifestoScientificDesc: "Akademik ve resmi kaynakları (.edu, .gov) ve PDF dosyalarını önceliklendirir.",
  manifestoEthicalName: "Etik & Odaklı",
  manifestoEthicalDesc: "Doğrudan kaynaklara odaklanmak için büyük sosyal medya platformlarını hariç tutar.",
  aiQueryAssistant: "Yapay Zeka Sorgu Asistanı",
  aiPromptPlaceholder: "Yapmak istediğiniz aramayı açıklayın...\nÖrn: 'PESTLE analizi hakkında bir sunum veya pdf dokümanı'",
  generateQuery: "Sorgu Oluştur",
  generating: "Oluşturuluyor...",
  aiErrorTitle: "Yapay Zeka Hatası",
  aiErrorBody: "Yapay zeka bir sorgu oluşturamadı. Lütfen tekrar deneyin veya isteğinizi farklı bir şekilde ifade edin.",
  selectAIModel: "Yapay Zeka Modeli Seç",
};

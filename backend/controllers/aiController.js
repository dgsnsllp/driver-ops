const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.reviseMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mesaj boş olamaz.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Eğer API Key girilmediyse, sistemi durdurmadan orijinal mesajı direkt geçir (Failsafe)
      return res.json({ isRevised: false, original: message, revised: message });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Sen bir otopark ve trafik asistanısın. İnsanlar hatalı park eden, kurallara uymayan araç sahiplerine anonim mesajlar gönderiyorlar. Bazen çok öfkeli, kaba, küfürlü veya tehditkar mesajlar yazabiliyorlar.

Görevin şu:
Aşağıdaki mesajı oku. Eğer mesajda küfür, hakaret, tehdit, argo veya aşırı agresif bir üslup varsa, bu mesajı "saygılı, resmi ve net" bir otopark/trafik uyarısına dönüştür. (Örneğin: "Arabayı buraya park edenin a*k*" -> "Aracınızı uygunsuz bir alana park ettiğinize dair bir şikayet aldınız. Lütfen kontrol ediniz.")
Eğer mesaj zaten saygılı ve normalse (Örneğin: "Sol tekeriniz inmiş", "Farlarınız açık kalmış"), HİÇBİR DEĞİŞİKLİK YAPMA ve aynen geri döndür.

DİKKAT: YALNIZCA mesajın son halini (düzeltilmiş veya aynı kalmış halini) yaz. Ekstra hiçbir açıklama, tırnak işareti, selamlaşma ekleme.

Mesaj: "${message}"
`;

    const result = await model.generateContent(prompt);
    let revisedMessage = result.response.text().trim();

    // Remove quotes if the AI added them
    if (revisedMessage.startsWith('"') && revisedMessage.endsWith('"')) {
      revisedMessage = revisedMessage.substring(1, revisedMessage.length - 1).trim();
    }

    // AI bazen "Aynı kalmış hali:" gibi önekler ekleyebilir, temizle. (İstisna durumu)
    
    const isRevised = revisedMessage.toLowerCase() !== message.toLowerCase() && revisedMessage.length > 0;

    res.json({
      isRevised,
      original: message,
      revised: isRevised ? revisedMessage : message
    });

  } catch (error) {
    console.error('Yapay Zeka Hatası:', error);
    // API hatası durumunda, mesajı bloklama, orijinaliyle devam et
    res.json({ isRevised: false, original: req.body.message, revised: req.body.message });
  }
};

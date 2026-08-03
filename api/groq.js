import Groq from 'groq-sdk';

export const analyzeBillWithAI = async (base64Image, mimeType) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables.');
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are an expense bill analysis assistant. Analyze the uploaded bill or receipt image and extract the expense details.

Return only valid JSON with these exact keys:
{
  "title": "merchant name or bill title",
  "amount": final payable total as a number,
  "category": "The specific type of bill (e.g., Food, Electricity, Water, Internet, Travel, Education, Health, Shopping, Entertainment, etc.)",
  "notes": "short note if anything is unclear, otherwise empty string"
}

Rules:
- Read the bill image carefully.
- Use the final payable amount, grand total, net amount, or total due.
- Do not use subtotal, tax amount, discount, or item price as the final amount.
- For "category", provide a single, concise word or short phrase that accurately describes the type of expense (e.g., "Electricity", "Food", "Travel", "Education", "Rent", "Internet"). Do not use generic terms like "Bills" or "Invoice" if a more specific category like "Electricity" or "Water" applies.
- If any field is unclear, make the best estimate and mention it in notes.
- Return JSON only. Do not include markdown or explanation.`;

  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0].message.content.trim();
  
  // Extract JSON if it's wrapped in markdown code blocks by accident
  let jsonStr = content;
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
  }

  try {
    const result = JSON.parse(jsonStr);
    return result;
  } catch (err) {
    console.error('Failed to parse Groq response as JSON:', jsonStr);
    throw new Error('Invalid JSON response from AI');
  }
};

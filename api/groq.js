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
  "category": "one of [\\"Food\\", \\"Transport\\", \\"Shopping\\", \\"Bills\\", \\"Health\\", \\"Entertainment\\", \\"Travel\\", \\"Education\\", \\"Other\\"]",
  "notes": "short note if anything is unclear, otherwise empty string"
}

Rules:
- Read the bill image carefully.
- Use the final payable amount, grand total, net amount, or total due.
- Do not use subtotal, tax amount, discount, or item price as the final amount unless no grand total is visible.
- DO NOT sum up individual items manually or perform repetitive arithmetic calculations. Just locate the printed total or subtotal directly from the bill.
- Choose the most suitable category based on the merchant and bill contents.
- If the image is a restaurant, cafe, grocery, or food delivery bill, use "Food".
- If any field is unclear, make the best estimate and mention it in notes.
- Keep your thinking/reasoning process very brief and concise.
- Return JSON only. Do not include markdown or explanation.`;

  const dataUrl = `data:${mimeType};base64,${base64Image}`;

  const completion = await groq.chat.completions.create({
    model: 'qwen/qwen3.6-27b',
    max_tokens: 2048,
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
    temperature: 0.3,
  });

  const content = completion.choices[0].message.content.trim();
  
  // Remove thinking blocks if present (e.g. <think>...</think>)
  let jsonStr = content;
  if (jsonStr.includes('</think>')) {
    jsonStr = jsonStr.split('</think>').pop().trim();
  }

  // Extract JSON if it's wrapped in markdown code blocks by accident
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
  }

  // Find the actual JSON object bounds as a fallback
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  }

  try {
    const result = JSON.parse(jsonStr);
    return result;
  } catch (err) {
    console.error('Failed to parse Groq response as JSON:', jsonStr);
    throw new Error('Invalid JSON response from AI');
  }
};

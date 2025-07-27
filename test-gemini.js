const API_KEY = 'AIzaSyD7BssDDN5kORTy4xR5NxxrIY3f512ZXnI';

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, can you say hi back?'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.7,
        }
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Success! AI response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('Error response:', responseText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGeminiAPI(); 
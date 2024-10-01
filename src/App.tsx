import React, { useState } from 'react';
import './App.css';

interface FormData {
  recipientName: string;
  jobTitle: string;
  companyName: string;
  industry: string;
  location: string;
  recentNews: string;
  keyChallenge: string;
  solution: string;
  caseStudy: string;
  cta: string;
  tone: string;
  urgency: string;
}

const initialFormData: FormData = {
  recipientName: "John Doe",
  jobTitle: "VP of Sales",
  companyName: "ABC Corp",
  industry: "SaaS",
  location: "San Francisco",
  recentNews: "ABC Corp recently raised $10M in Series B funding and is expanding into new markets.",
  keyChallenge: "Struggling to scale the sales team and improve customer engagement.",
  solution: "Our platform helps SaaS companies streamline sales processes and boost customer engagement through personalized marketing automation.",
  caseStudy: "We helped XYZ Corp (a competitor) increase engagement by 30%.",
  cta: "Schedule a 10-minute call to discuss how our solution could benefit ABC Corp.",
  tone: "Professional but friendly",
  urgency: "Mention the potential to kick off a conversation this week."
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const generatePrompt = (data: FormData): string => {
    return `Generate a personalized outreach email for ${data.recipientName}, ${data.jobTitle} at ${data.companyName}, a ${data.industry} company based in ${data.location}. ${data.recentNews} The email should reference this news and address their challenge of ${data.keyChallenge} The product we're offering is ${data.solution} Include a case study: ${data.caseStudy} The tone should be ${data.tone}, with a call to action: ${data.cta} ${data.urgency}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = generatePrompt(formData);

    console.log('Sending request to OpenAI API...');
    console.log('Prompt:', prompt);

    try {
      const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // Store API key in a variable
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // Use the variable here
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates personalized outreach emails."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 500,
          n: 1,
          temperature: 0.7,
        })
      });

      console.log('Response status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.choices && data.choices.length > 0) {
        setGeneratedEmail(data.choices[0].message.content.trim());
      } else {
        console.error('No choices in API response:', data);
        throw new Error('No choices returned from the API');
      }
    } catch (error) {
      console.error('Error details:', error);
      setGeneratedEmail('An error occurred while generating the email. Please check the console for more details.');
    }
  };

  return (
    <div className="App">
      <h1>Basho Email Generator</h1>
      <form onSubmit={handleSubmit}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            {key === 'recentNews' || key === 'keyChallenge' || key === 'solution' || key === 'caseStudy' || key === 'cta' || key === 'urgency' ? (
              <textarea
                id={key}
                name={key}
                value={value}
                onChange={handleInputChange}
                required
              />
            ) : (
              <input
                type="text"
                id={key}
                name={key}
                value={value}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
        ))}
        <button type="submit">Generate Email</button>
      </form>

      <h2>Generated Email:</h2>
      <pre>{generatedEmail}</pre>
    </div>
  );
}

export default App;
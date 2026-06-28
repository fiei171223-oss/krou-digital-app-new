import fetch from 'node-fetch';

async function testAnalyze() {
  const promptText = `អ្នកគឺជា «អ្នកជំនាញវិធីសាស្ត្របង្រៀនសតវត្សទី២១»...
  សូមត្រលប់មកវិញតែជាទម្រង់ JSON...`;
  try {
    const res = await fetch('http://localhost:3000/api/generateLessonPlan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText: "analyze it" })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 100)); // Print start of response
  } catch (e) {
    console.log(e);
  }
}

testAnalyze();

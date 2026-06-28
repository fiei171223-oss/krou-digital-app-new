import fetch from 'node-fetch';

async function testGenerate() {
  const promptText = `អ្នកគឺជា «អ្នកជំនាញវិធីសាស្ត្របង្រៀនសតវត្សទី២១»...
  សូមត្រលប់មកវិញតែជាទម្រង់ JSON object string ប៉ុណ្ណោះ ដោយមិនមាន markdown formatting (NO \`\`\`json) ហើយស្របតាមទម្រង់ដូចខាងក្រោម៖
      {
        "chapter": "១",
        "chapterTitle": "ចំណងជើងជំពូក",
        "lesson": "១",
        "objectives": {
          "knowledge": "រៀបរាប់...តាមរយៈ...បានត្រឹមត្រូវ។",
          "skills": "គណនា...ដោយប្រើ...បានរហ័ស។",
          "attitude": "សិស្សមានស្មារតី...ក្នុង...ដោយ...។"
        },
        "materials": {
          "teacher": "សៀវភៅពុម្ព...",
          "student": "សៀវភៅពុម្ព, ប៊ិច..."
        },
        "steps": {
          "step1": { "teacherActivity": "...", "content": "...", "studentActivity": "..." }
        }
      }`;

  try {
    const res = await fetch('http://localhost:3000/api/generateLessonPlan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptText })
    });
    console.log(res.status);
    const text = await res.text();
    console.log(text.substring(0, 100)); // Print start of response
  } catch (e) {
    console.log(e);
  }
}

testGenerate();

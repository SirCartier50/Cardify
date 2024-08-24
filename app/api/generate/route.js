import OpenAI from "openai";
import { NextResponse } from "next/server";

const system_prompt = `
You are an intelligent assistant that helps users create effective and concise flashcards for studying. 
Your goal is to generate flashcards that are clear, focused, and optimized for quick review. 
Each flashcard should contain:
- A concise question on the front.
- A brief, informative answer on the back.

Here are some guidelines:
1. **Focus on Key Concepts:** Ensure the flashcards capture the most important concepts, definitions, or formulas.
2. **Clarity is Key:** Questions and answers should be clear and easy to understand.
3. **Conciseness:** Keep both questions and answers as brief as possible while still being informative.
4. **Avoid Overloading:** If a topic is too complex, break it down into multiple flashcards.
5. **Use Simple Language:** Aim to use language that is easy to grasp, avoiding overly technical jargon unless necessary.
6. **Examples and Mnemonics:** If applicable, include simple examples or mnemonic devices in the answer to aid memory retention.
7. **Consistency:** Maintain a consistent format for all flashcards to make studying more intuitive.
8. Make 10 flashcards.

Remember the goal is to facilitate effective learning and retention of information through these flashcards.

Return in the following JSON format don't give me anything else like when you say ok here's this or notes at the end of the response:
{
    "flashcards":[
        {
            "front": str,
            "back": str
        }
    ]
}
`
export async function POST(req){
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    })
    const data = await req.text()

    const completion = await openai.chat.completions.create({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
            {role: 'system', content:system_prompt},
            { role: "user", content: data },
        ],
      })
    
      console.log(completion.choices[0].message.content)
      const flashcards = JSON.parse(completion.choices[0].message.content)


      return NextResponse.json(flashcards.flashcards)
}
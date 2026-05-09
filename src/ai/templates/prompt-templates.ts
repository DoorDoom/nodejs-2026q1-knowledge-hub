import { Status } from '../dto/summarize-article.dto';

export function summarizeTemplate(content: string, status: Status) {
  return `
          Summarize the following article ${
            status === Status.SHORT
              ? 'in 3-5 concise bullet points'
              : status === Status.MEDIUM
                ? 'shortly'
                : 'in detail'
          }:
    
          ${content}
      `;
}

export function translateTemplate(
  content: string,
  targetLang: string,
  sourceLanguage?: string,
) {
  return `
      Translate the following article ${
        sourceLanguage ? `from ${sourceLanguage}` : ''
      }
      to ${targetLang}:

      ${content}
  `;
}

export function analysisTemplate(content: string, task: string) {
  return `
      Analyze the following article for ${task} task.

      Return ONLY valid JSON (no markdown, no explanations) in this exact format:
      {
        "analysis": string,
        "suggestions": string[],
        "severity": "info" | "warning" | "error"
      }

      Rules:
      - "analysis": short explanation of the content quality
      - "suggestions": list of improvements
      - "severity":
        - "info" = good quality
        - "warning" = some issues
        - "error" = poor quality

      Article:
      ${content}
    `;
}

export function simpleTemplate() {
  return `Node.js Best Practices`;
}

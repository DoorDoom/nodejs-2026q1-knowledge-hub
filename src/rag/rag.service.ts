import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { GeminiAiService } from 'src/gemini-ai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RagService {
  model = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
  chunkSize = Number(process.env.RAG_CHUNK_SIZE) || 800;
  overlap = Number(process.env.RAG_CHUNK_OVERLAP) || 200;

  chunkText(text: string): string[] {
    const chunks: string[] = [];

    let start = 0;

    while (start < text.length) {
      const end = start + this.chunkSize;

      chunks.push(text.slice(start, end));

      start += this.chunkSize - this.overlap;
    }

    return chunks;
  }

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiAiService,
  ) {}

  async embedTexts(texts: string[]): Promise<number[][]> {
    let chunks = [];
    texts.forEach((text) => (chunks = [...chunks, ...this.chunkText(text)]));

    if (chunks.length < 2) throw new Error('incorrect chuncks');
    const response = await this.gemini.ai.models.embedContent({
      model: this.model,
      contents: chunks,
      config: { taskType: 'RETRIEVAL_DOCUMENT' },
    });

    console.log(response.embeddings.length);
    console.log(chunks.length);

    return response.embeddings.map((e) => e.values);
  }
}

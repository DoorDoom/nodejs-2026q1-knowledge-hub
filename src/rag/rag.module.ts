import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { GeminiAiService } from 'src/gemini-ai.service';

@Module({
  controllers: [],
  providers: [RagService, GeminiAiService],
  exports: [RagService],
})
export class RagModule {}

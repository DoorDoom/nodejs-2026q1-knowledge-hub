import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RagModule } from 'src/rag/rag.module';
import { GeminiAiService } from 'src/gemini-ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService, GeminiAiService],
  imports: [RagModule],
})
export class AiModule {}

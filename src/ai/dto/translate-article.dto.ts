import { IsOptional, IsString } from 'class-validator';

export class TranslateArticleDto {
  @IsString({ message: 'targetLanguage must be string' })
  targetLanguage: string;

  @IsOptional()
  @IsString({ message: 'sourceLanguage must be string' })
  sourceLanguage: string;
}

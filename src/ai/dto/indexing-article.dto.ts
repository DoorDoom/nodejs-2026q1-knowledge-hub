import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class IndexArticleDto {
  @IsOptional()
  @IsBoolean()
  onlyPublished?: boolean;

  @IsOptional()
  @IsArray()
  articleIds?: string[];
}

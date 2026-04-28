import { IsOptional, IsEnum } from 'class-validator';

export const Status = {
  SHORT: 'short',
  MEDIUM: 'medium',
  DETAILED: 'detailed',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export class SummarizeArticleDto {
  @IsOptional()
  @IsEnum(Status, { message: 'Invalid status' })
  status?: Status;
}

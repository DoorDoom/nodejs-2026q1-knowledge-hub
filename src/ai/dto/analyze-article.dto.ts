import { IsEnum, IsOptional, IsString } from 'class-validator';

export const Task = {
  REVIEW: 'review',
  BUGS: 'bugs',
  OPTIMIZE: 'optimize',
  EXPLAIN: 'explain',
} as const;

export type Task = (typeof Task)[keyof typeof Task];

export class AnalyzeArticleDto {
  @IsOptional()
  @IsEnum(Task, { message: 'Invalid task' })
  task?: Task;
}

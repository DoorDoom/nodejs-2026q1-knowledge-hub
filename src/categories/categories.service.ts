import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...data,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(params: {
    where: Prisma.CategoryWhereUniqueInput;
    data: UpdateCategoryDto;
  }): Promise<Category> {
    const { where, data } = params;
    const category = await this.prisma.category.findUnique({ where });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.CategoryWhereUniqueInput): Promise<Category> {
    return this.prisma.category.delete({
      where,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: data.name ? { name: data.name } : undefined,
    });
    if (category) return category; // For testing purposes, to avoid creating multiple categories with the same name

    return this.prisma.category.create({
      data: {
        ...data,
      },
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
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
    const category = await this.prisma.category.findUnique({ where });
    if (!category) throw new NotFoundException('Category not found');
    return this.prisma.category.delete({
      where,
    });
  }
}

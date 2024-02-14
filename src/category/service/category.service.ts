import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../repository/category.repository';
import { CategoryResponse } from '../dto/categoryResponse';
import { Transactional } from 'typeorm-transactional';
import { OnEvent } from '@nestjs/event-emitter';
import { isEmpty } from '@nestjs/class-validator';
import { CategoryNotFoundException } from '../exception/category.exception';

@Injectable()
export class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  @Transactional()
  async findUsingCategories() {
    const categories = await this.categoryRepository.findAll();

    return categories.map(CategoryResponse.from);
  }

  @OnEvent('category.validate')
  async validateExistence(categoryId: number) {
    const category = await this.categoryRepository.findByCategoryId(categoryId);
    if (isEmpty(category)) throw new CategoryNotFoundException();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook } from '../entity/workbook';
import { Repository } from 'typeorm';

@Injectable()
export class WorkbookRepository {
  constructor(
    @InjectRepository(Workbook) private repository: Repository<Workbook>,
  ) {}

  async query(query: string) {
    return await this.repository.query(query);
  }

  async save(workbook: Workbook) {
    return await this.repository.save(workbook);
  }

  async insert(workbook: Workbook) {
    return await this.repository.insert(workbook);
  }

  async findByNameAndMemberId(title: string, memberId: number) {
    return await this.repository.findOneBy({
      title: title,
      memberId: memberId,
    });
  }

  async findAllbyMemberId(memberId: number) {
    return this.repository
      .createQueryBuilder('Workbook')
      .where('Workbook.member = :state', { state: memberId })
      .getMany();
  }

  async findAll() {
    return this.repository
      .createQueryBuilder('Workbook')
      .where('Workbook.isPublic = :state', { state: true })
      .orderBy('Workbook.copyCount', 'DESC')
      .getMany();
  }

  async findAllByCategoryId(categoryId: number) {
    return this.repository
      .createQueryBuilder('Workbook')
      .where('Workbook.isPublic = :state', { state: true })
      .andWhere('workbook.category = :categoryId', { categoryId })
      .orderBy('Workbook.copyCount', 'DESC')
      .getMany();
  }

  async findTop5Workbooks() {
    return await this.repository
      .createQueryBuilder('Workbook')
      .select()
      .where('Workbook.isPublic = :state', { state: true })
      .orderBy('Workbook.copyCount', 'DESC')
      .limit(5)
      .getMany();
  }

  async findMembersWorkbooks(memberId: number) {
    return await this.repository
      .createQueryBuilder('Workbook')
      .where('Workbook.member = :memberId', { memberId })
      .orderBy('Workbook.copyCount', 'DESC')
      .getMany();
  }

  async findById(id: number) {
    return await this.repository
      .createQueryBuilder('Workbook')
      .where('Workbook.id = :id', { id })
      .getOne();
  }

  async findByIdWithoutJoin(id: number) {
    return await this.repository.findOneBy({ id: id });
  }

  async update(workbook: Workbook) {
    return await this.repository.update({ id: workbook.id }, workbook);
  }

  async remove(workbook: Workbook) {
    await this.repository.remove(workbook);
  }

  async removeAll(workbooks: Workbook[]) {
    await this.repository.remove(workbooks);
  }
}

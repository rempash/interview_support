import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technology } from './technology.entity';
import { CreateTechnologyDto } from './create-technology.dto';

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectRepository(Technology)
    private technologyRepository: Repository<Technology>,
  ) {}

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    const existing = await this.technologyRepository.findOne({ where: { name: createTechnologyDto.name } });
    if (existing) {
      throw new ConflictException('Technology already exists');
    }
    const tech = this.technologyRepository.create(createTechnologyDto);
    return this.technologyRepository.save(tech);
  }

  findAll(): Promise<Technology[]> {
    return this.technologyRepository.find({ order: { name: 'ASC' } });
  }

  async update(id: string, updateTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    const tech = await this.technologyRepository.findOne({ where: { id } });
    if (!tech) {
      throw new NotFoundException('Technology not found');
    }
    
    if (updateTechnologyDto.name !== tech.name) {
      const existing = await this.technologyRepository.findOne({ where: { name: updateTechnologyDto.name } });
      if (existing) {
        throw new ConflictException('Technology name already exists');
      }
    }

    tech.name = updateTechnologyDto.name;
    return this.technologyRepository.save(tech);
  }

  async remove(id: string): Promise<void> {
    const result = await this.technologyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Technology not found');
    }
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find({ order: { created_at: 'DESC' } });
  }

  async create(name: string): Promise<Project> {
    const existing = await this.projectsRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException(`Project with name '${name}' already exists`);
    }
    const project = this.projectsRepository.create({ name });
    return this.projectsRepository.save(project);
  }

  async update(id: string, name: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.name !== name) {
      const existing = await this.projectsRepository.findOne({ where: { name } });
      if (existing) {
        throw new ConflictException(`Project with name '${name}' already exists`);
      }
      project.name = name;
    }
    
    return this.projectsRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}

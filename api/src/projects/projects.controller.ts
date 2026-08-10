import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    return this.projectsService.findAll();
  }

  @Post()
  @Roles(Role.SUPERUSER)
  async create(@Body() body: { name: string }) {
    if (!body.name || body.name.length < 2) {
      throw new BadRequestException('Project name must be at least 2 characters long');
    }
    return this.projectsService.create(body.name);
  }

  @Put(':id')
  @Roles(Role.SUPERUSER)
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    if (!body.name || body.name.length < 2) {
      throw new BadRequestException('Project name must be at least 2 characters long');
    }
    return this.projectsService.update(id, body.name);
  }

  @Delete(':id')
  @Roles(Role.SUPERUSER)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}

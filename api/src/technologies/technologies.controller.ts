import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './create-technology.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('technologies')
@UseGuards(JwtAuthGuard)
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERUSER)
  create(@Body() createTechnologyDto: CreateTechnologyDto) {
    return this.technologiesService.create(createTechnologyDto);
  }

  @Get()
  findAll() {
    return this.technologiesService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERUSER)
  update(@Param('id') id: string, @Body() updateTechnologyDto: CreateTechnologyDto) {
    return this.technologiesService.update(id, updateTechnologyDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERUSER)
  remove(@Param('id') id: string) {
    return this.technologiesService.remove(id);
  }
}

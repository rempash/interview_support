import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERUSER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    const user = await this.usersService.create(body);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const user = await this.usersService.update(id, body);
    const { passwordHash, ...result } = user;
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    // Prevent self-deletion
    if (req.user.sub === id) {
      throw new ForbiddenException('Superusers cannot delete their own accounts.');
    }
    return this.usersService.remove(id);
  }
}

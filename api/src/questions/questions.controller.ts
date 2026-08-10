import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('projects/:projectId/technologies/:technology/questions')
@UseGuards(JwtAuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(Role.MANAGER, Role.SUPERUSER)
  syncQuestions(
    @Param('projectId') projectId: string,
    @Param('technology') technology: string
  ) {
    return this.questionsService.syncQuestions(projectId, technology);
  }

  @Get()
  getQuestions(
    @Param('projectId') projectId: string,
    @Param('technology') technology: string
  ) {
    return this.questionsService.getQuestions(projectId, technology);
  }

  @Post('evaluate')
  evaluateAnswer(
    @Param('technology') technology: string,
    @Body('question') question: string,
    @Body('answer') answer: string,
  ) {
    return this.questionsService.evaluateAnswer(technology, question, answer);
  }
}

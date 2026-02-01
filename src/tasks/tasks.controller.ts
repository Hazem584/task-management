import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './entities/task.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}
  @Get()
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.tasksService.getAllTasks(filterDto, user);
  }
  @Get('/:id')
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`User "${user.username}" retrieving task "${id}"`);
    return this.tasksService.getTasksById(id, user);
  }
  @Post()
  createTask(
    @Body() CreateTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" creating a new task. Data: ${JSON.stringify(
        CreateTaskDto,
      )}`,
    );
    return this.tasksService.createTask(CreateTaskDto, user);
  }
  @Delete('/:id')
  delateTask(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    this.logger.verbose(`User "${user.username}" deleting task "${id}"`);
    return this.tasksService.deleteTask(id, user);
  }
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatus: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" updating task "${id}" status to "${updateTaskStatus.status}"`,
    );
    const { status } = updateTaskStatus;
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}

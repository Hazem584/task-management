import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './enums/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/entities/user.entity';
import { Logger } from '@nestjs/common';
@Injectable()
export class TasksService {
  private logger = new Logger('TasksService', { timestamp: true });
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}
  async getAllTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.taskRepository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(
          filterDto,
        )}`,
        error.stack,
      );
      throw new NotFoundException();
    }
  }

  async getTasksById(id: string, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id, user } });
    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return found;
  }
  async createTask(CreateTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = CreateTaskDto;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.TODO,
      user,
    });
    await this.taskRepository.save(task);
    return task;
  }
  async deleteTask(id: string, user: User): Promise<{ message: string }> {
    const result = await this.taskRepository.delete(id && { user });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    return { message: 'Task deleted successfully' };
  }
  updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
    return this.getTasksById(id, user).then((task) => {
      task.status = status;
      return this.taskRepository.save(task);
    });
  }
}

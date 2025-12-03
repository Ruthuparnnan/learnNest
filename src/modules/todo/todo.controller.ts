import { Controller, Get, Post, Body } from '@nestjs/common';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  createTodo(@Body('title') title: string) {
    return this.todoService.create(title);
  }

  @Get()
  getAllTodos() {
    return this.todoService.findAll();
  }
}

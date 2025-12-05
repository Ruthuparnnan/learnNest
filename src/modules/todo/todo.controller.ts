import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  @Post()
  createTodo(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto.title);
  }

  @Get()
  getAllTodos() {
    return this.todoService.findAll();
  }

  @Patch(':id')
  updateTodo(@Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.todoService.edit(id, dto.completed ?? false);
  }
}

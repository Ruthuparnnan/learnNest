import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from 'src/schemas/todo.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel('Todo') private readonly todoModel: Model<Todo>) {}

  create(title: string) {
    return this.todoModel.create({ title });
  }

  findAll() {
    return this.todoModel.find();
  }

  edit(id: string, title: string) {
    return this.todoModel.findByIdAndUpdate(id, { title }, { new: true });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
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

  edit(id: string, completed: boolean) {
    return this.todoModel.findByIdAndUpdate(id, { completed }, { new: true });
  }

  delete(id: string) {
    this.todoModel.deleteOne({ _id: new Types.ObjectId(id) });
    return { message: 'Todo deleted' };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs at 00:00 every day
  async resetAllTodos() {
    const result = await this.todoModel.updateMany({}, { completed: false });
    console.log(`✅ Reset ${result.modifiedCount} todos to incomplete`);
  }
}

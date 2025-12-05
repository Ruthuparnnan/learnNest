import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Todo } from 'src/schemas/todo.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel('Todo') private readonly todoModel: Model<Todo>) {}

  create(input: { title: string } | string) {
    const data = typeof input === 'string' ? { title: input } : input;
    return this.todoModel.create(data);
  }

  findAll() {
    return this.todoModel.find();
  }

  findOne(id: string) {
    return this.todoModel.findById(id);
  }

  edit(id: string, input: { completed?: boolean } | boolean) {
    const updateData =
      typeof input === 'boolean' ? { completed: input } : input;
    return this.todoModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string) {
    const result = await this.todoModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    return result.deletedCount > 0;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs at 00:00 every day
  async resetAllTodos() {
    const result = await this.todoModel.updateMany({}, { completed: false });
    console.log(`✅ Reset ${result.modifiedCount} todos to incomplete`);
  }
}

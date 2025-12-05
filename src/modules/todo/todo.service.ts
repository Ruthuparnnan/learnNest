import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid todo ID format');
    }
    const todo = await this.todoModel.findById(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async edit(id: string, input: { completed?: boolean } | boolean) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid todo ID format');
    }
    const updateData =
      typeof input === 'boolean' ? { completed: input } : input;
    const todo = await this.todoModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid todo ID format');
    }
    const result = await this.todoModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Todo not found');
    }
    return true;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // Runs at 00:00 every day
  async resetAllTodos() {
    const result = await this.todoModel.updateMany({}, { completed: false });
    console.log(`✅ Reset ${result.modifiedCount} todos to incomplete`);
  }
}

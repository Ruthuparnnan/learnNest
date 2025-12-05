import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TodoSchema } from 'src/schemas/todo.schema';
import { TodoResolver } from './graphql/todo.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Todo',
        schema: TodoSchema,
      },
    ]),
  ],
  providers: [TodoService, TodoResolver],
  controllers: [TodoController],
  exports: [TodoService],
})
export class TodoModule {}

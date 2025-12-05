import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { TodoService } from '../todo.service';
import { TodoType } from './todo.type';
import { CreateTodoInput } from './create-todo.input';
import { UpdateTodoInput } from './update-todo.input';

@Resolver(() => TodoType)
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  // ✅ GET ALL TODOS
  @Query(() => [TodoType])
  todos() {
    return this.todoService.findAll();
  }

  // ✅ GET SINGLE TODO
  @Query(() => TodoType)
  todo(@Args('id', { type: () => ID }) id: string) {
    return this.todoService.findOne(id);
  }

  // ✅ CREATE TODO
  @Mutation(() => TodoType)
  createTodo(@Args('input') input: CreateTodoInput) {
    return this.todoService.create(input);
  }

  //   ✅ UPDATE TODO
  @Mutation(() => TodoType)
  updateTodo(
    @Args('id', { type: () => String }) id: string,
    @Args('input') input: UpdateTodoInput,
  ) {
    return this.todoService.edit(id, input); // ✅ pass full input object
  }

  // ✅ DELETE TODO
  @Mutation(() => Boolean)
  deleteTodo(@Args('id', { type: () => ID }) id: string) {
    return this.todoService.delete(id);
  }
}

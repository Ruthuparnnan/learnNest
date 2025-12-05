import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateTodoInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  title: string;
}

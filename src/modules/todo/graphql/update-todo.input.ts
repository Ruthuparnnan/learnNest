import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateTodoInput {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @Field({ nullable: true })
  completed?: boolean;
}

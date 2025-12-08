import { ObjectType, Field, PartialType } from '@nestjs/graphql';
import { AuthResponse } from './auth-response.type';

@ObjectType()
export class RefreshResponse extends PartialType(AuthResponse) {}

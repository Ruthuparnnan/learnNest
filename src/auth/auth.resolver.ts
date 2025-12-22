import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.type';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user.sub);
  }
}

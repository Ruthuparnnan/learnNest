import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { AuthResponse } from './dto/auth-response.type';
import { LoginUserInput } from './dto/login-user-input';
import { RefreshResponse } from './dto/refresh-response.type';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  users() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  user(@Args('id', { type: () => ID }) id: string) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  removeUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.remove(id);
  }

  // LOGIN
  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginUserInput, @Context() ctx: any) {
    const { accessToken, refreshToken } = await this.userService.login(
      input.email,
      input.password,
    );
    // ✅ SET REFRESH TOKEN COOKIE
    ctx.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // ✅ use true in production (https)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 days
    });

    return { accessToken };
  }

  // REFRESH TOKEN
  @Mutation(() => RefreshResponse)
  async refresh(@Context() ctx: any) {
    const refreshToken = ctx.req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const userId = ctx.req.user?.sub; // or decode from token if needed

    const { accessToken, refreshToken: newRefreshToken } =
      await this.userService.refreshTokens(userId, refreshToken);

    // ✅ ROTATE COOKIE
    ctx.res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  // LOGOUT
  @Mutation(() => Boolean)
  async logout(@Context() ctx: any) {
    const userId = ctx.req.user.sub;

    await this.userService.logout(userId);

    ctx.res.clearCookie('refreshToken');
    return true;
  }
}

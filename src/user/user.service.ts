import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { GraphQLError } from 'graphql';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const user = await this.userModel.findOne({ email: createUserInput.email });
    if (user) {
      throw new NotFoundException('Email already in use');
    }
    const hashedPassword = await argon2.hash(createUserInput.password);
    const refreshToken = await argon2.hash(
      crypto.randomBytes(32).toString('hex'),
    );
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // ✅ 7 days expiry
    return this.userModel.create({
      ...createUserInput,
      password: hashedPassword,
      refreshToken,
      refreshTokenExpiresAt,
    });
  }

  findAll() {
    return this.userModel.find();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID format');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID format');
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserInput,
      { new: true }, // ✅ THIS IS CORRECT
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid user ID format');
    }
    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
    return true;
  }

  async login(email: string, password: string, correlationId: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new GraphQLError('Invalid email', {
        extensions: {
          code: 'UNAUTHORIZED',
          statusCode: 401,
          correlationId,
        },
      });
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new GraphQLError('Invalid password', {
        extensions: {
          code: 'UNAUTHORIZED',
          statusCode: 401,
          correlationId,
        },
      });
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return {
      accessToken,
      refreshToken: user.refreshToken,
    };
  }

  // refresh tokens
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    // ✅ Verify refresh token
    const isValid = await argon2.verify(user.refreshToken, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // ✅ Check expiry
    if (
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // ✅ ROTATE refresh token
    const newRefreshToken = randomBytes(64).toString('hex');
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 7);

    user.refreshToken = newRefreshTokenHash;
    user.refreshTokenExpiresAt = newExpiry;
    await user.save();

    // ✅ Generate new access token
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // ⚠️ sent only to resolver for cookie
    };
  }

  // LOGOUT
  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.refreshToken = undefined;
    user.refreshTokenExpiresAt = undefined;
    await user.save();
    return true;
  }
}

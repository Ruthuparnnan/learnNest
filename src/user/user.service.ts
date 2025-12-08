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

  // ✅ user.service.ts
  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
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
}

import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PopulatedFavorite } from '../interfaces/populated-favorite.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // СОЗДАНИЕ пользователя
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, password, name } = createUserDto;

    // Проверяем существует ли пользователь
    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем пользователя
    const user = new this.userModel({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      isAdmin: false,
    });

    return await user.save();
  }

  // ПОИСК по email (для аутентификации) - с паролем
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password') // Явно запрашиваем пароль
      .exec();
  }

  // ПОИСК по ID
  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ОБНОВЛЕНИЕ пользователя
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем email на уникальность
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
      });
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
      user.email = updateUserDto.email.toLowerCase();
    }

    // Обновляем пароль если предоставлен
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Обновляем остальные поля
    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.isAdmin !== undefined)
      user.isAdmin = updateUserDto.isAdmin;

    return await user.save();
  }

  // ДОБАВЛЕНИЕ в избранное
  async addToFavorites(userId: string, movieId: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(movieId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favorites: new Types.ObjectId(movieId) } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // УДАЛЕНИЕ из избранного
  async removeFromFavorites(
    userId: string,
    movieId: string,
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(movieId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favorites: new Types.ObjectId(movieId) } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ПОЛУЧЕНИЕ избранного с populate
  async getFavorites(userId: string): Promise<PopulatedFavorite[]> {
    const user = await this.userModel
      .findById(userId)
      .populate<{ favorites: PopulatedFavorite[] }>('favorites')
      .exec();

    return user?.favorites || [];
  }

  // ВАЛИДАЦИЯ пароля
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ПОЛУЧЕНИЕ всех пользователей
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  // УДАЛЕНИЕ пользователя
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  // КОЛИЧЕСТВО пользователей
  async getCount(): Promise<number> {
    return this.userModel.countDocuments();
  }
}

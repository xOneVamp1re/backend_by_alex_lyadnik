/* import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';
import { Types } from 'mongoose';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
interface FavoriteResponse {
  id: string;
  title: string;
  year: number;
  genre: string[];
  poster?: string;
  rating: number;
  duration: number;
}
// Более безопасная функция преобразования
function toUserResponse(user: UserDocument): UserResponse {
  if (!user) {
    throw new Error('User document is null or undefined');
  }

  const id =
    user._id instanceof Types.ObjectId
      ? user._id.toString()
      : typeof user.id === 'string'
        ? user.id
        : '';

  return {
    id,
    email: String(user.email),
    name: String(user.name),
    isAdmin: Boolean(user.isAdmin),
    favorites: Array.isArray(user.favorites) ? user.favorites : [],
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(),
  };
}

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // РЕГИСТРАЦИЯ
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.create(createUserDto);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'User registered successfully',
      user: userResponse,
    };
  }

  // ПОЛУЧЕНИЕ профиля
  @Get('profile/:id')
  async getProfile(@Param('id') id: string): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.findById(id);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Profile retrieved successfully',
      user: userResponse,
    };
  }

  // ОБНОВЛЕНИЕ профиля
  @Put('profile/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.update(id, updateUserDto);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Profile updated successfully',
      user: userResponse,
    };
  }

  // ДОБАВЛЕНИЕ в избранное
  @Post('favorites/:userId/:movieId')
  async addToFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.addToFavorites(userId, movieId);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Movie added to favorites',
      user: userResponse,
    };
  }

  // УДАЛЕНИЕ из избранного
  @Delete('favorites/:userId/:movieId')
  async removeFromFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.removeFromFavorites(userId, movieId);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Movie removed from favorites',
      user: userResponse,
    };
  }

  // ПОЛУЧЕНИЕ избранного
  @Get('favorites/:userId')
  async getFavorites(@Param('userId') userId: string): Promise<{
    message: string;
    favorites: FavoriteResponse[];
  }> {
    const favorites = await this.usersService.getFavorites(userId);

    const favoritesResponse: FavoriteResponse[] = favorites.map((movie) => ({
      id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster,
      rating: movie.rating,
      duration: movie.duration,
    }));

    return {
      message: 'Favorites retrieved successfully',
      favorites: favoritesResponse,
    };
  }

  // ПОЛУЧЕНИЕ всех пользователей
  @Get()
  async getAllUsers(): Promise<{
    message: string;
    users: UserResponse[];
  }> {
    const users = await this.usersService.findAll();

    const usersResponse: UserResponse[] = users.map((user) =>
      toUserResponse(user),
    );

    return {
      message: 'Users retrieved successfully',
      users: usersResponse,
    };
  }

  // КОЛИЧЕСТВО пользователей
  @Get('count')
  async getUsersCount(): Promise<{
    message: string;
    count: number;
  }> {
    const countResult = await this.usersService.getCount();
    const count: number = typeof countResult === 'number' ? countResult : 0;

    return {
      message: 'Users count retrieved successfully',
      count,
    };
  }

  // УДАЛЕНИЕ пользователя
  @Delete(':id')
  @HttpCode(200)
  async deleteUser(@Param('id') id: string): Promise<{
    message: string;
  }> {
    await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';
import { Types } from 'mongoose';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  favorites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
interface FavoriteResponse {
  id: string;
  title: string;
  year: number;
  genre: string[];
  poster?: string;
  rating: number;
  duration: number;
}

// Типизированный Request с пользователем
interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

function toUserResponse(user: UserDocument): UserResponse {
  if (!user) {
    throw new Error('User document is null or undefined');
  }

  const id =
    user._id instanceof Types.ObjectId
      ? user._id.toString()
      : typeof user.id === 'string'
        ? user.id
        : '';

  return {
    id,
    email: String(user.email),
    name: String(user.name),
    isAdmin: Boolean(user.isAdmin),
    favorites: Array.isArray(user.favorites) ? user.favorites : [],
    createdAt: user.createdAt instanceof Date ? user.createdAt : new Date(),
    updatedAt: user.updatedAt instanceof Date ? user.updatedAt : new Date(),
  };
}

/* @Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ ОТКРЫТЫЙ МАРШРУТ - регистрация
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.create(createUserDto);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'User registered successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - получение профиля (только свой профиль или админ)
  @Get('profile/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Админ может смотреть любой профиль
  async getProfile(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    // Если не админ - может смотреть только свой профиль
    if (!req.user.isAdmin && req.user.sub !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const user = await this.usersService.findById(id);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Profile retrieved successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - обновление профиля (только свой профиль)
  @Put('profile/:id')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    this.checkUserAccess(id, req.user.sub);
    const user = await this.usersService.update(id, updateUserDto);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Profile updated successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - добавление в избранное (только свое избранное)
  @Post('favorites/:userId/:movieId')
  @UseGuards(JwtAuthGuard)
  async addToFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    this.checkUserAccess(userId, req.user.sub);
    const user = await this.usersService.addToFavorites(userId, movieId);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Movie added to favorites',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - удаление из избранного (только свое избранное)
  @Delete('favorites/:userId/:movieId')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    this.checkUserAccess(userId, req.user.sub);
    const user = await this.usersService.removeFromFavorites(userId, movieId);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'Movie removed from favorites',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - получение избранного (только свое избранное)
  @Get('favorites/:userId')
  @UseGuards(JwtAuthGuard)
  async getFavorites(
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    favorites: FavoriteResponse[];
  }> {
    this.checkUserAccess(userId, req.user.sub);
    const favorites = await this.usersService.getFavorites(userId);

    const favoritesResponse: FavoriteResponse[] = favorites.map((movie) => ({
      id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster,
      rating: movie.rating,
      duration: movie.duration,
    }));

    return {
      message: 'Favorites retrieved successfully',
      favorites: favoritesResponse,
    };
  }

  // ✅ АДМИНСКИЙ - получение всех пользователей
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers(): Promise<{
    message: string;
    users: UserResponse[];
  }> {
    const users = await this.usersService.findAll();
    const usersResponse: UserResponse[] = users.map((user) =>
      toUserResponse(user),
    );

    return {
      message: 'Users retrieved successfully',
      users: usersResponse,
    };
  }

  // ✅ АДМИНСКИЙ - количество пользователей
  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getUsersCount(): Promise<{
    message: string;
    count: number;
  }> {
    const countResult = await this.usersService.getCount();
    const count: number = typeof countResult === 'number' ? countResult : 0;

    return {
      message: 'Users count retrieved successfully',
      count,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - удаление пользователя (админ или сам пользователь)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteUser(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
  }> {
    if (req.user.sub !== id && !req.user.isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }

  // 🔒 Вспомогательный метод для проверки прав доступа
  private checkUserAccess(targetUserId: string, currentUserId: string) {
    if (targetUserId !== currentUserId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
 */
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ ОТКРЫТЫЙ МАРШРУТ - регистрация
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = await this.usersService.create(createUserDto);
    const userResponse: UserResponse = toUserResponse(user);

    return {
      message: 'User registered successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - получение профиля (только свой профиль или админ)
  @Get('profile/:id')
  @UseGuards(AuthGuard)
  async getProfile(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = req.user;

    // Если не админ - может смотреть только свой профиль
    if (!user.isAdmin && user.sub !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }

    const userData = await this.usersService.findById(id);
    const userResponse: UserResponse = toUserResponse(userData);

    return {
      message: 'Profile retrieved successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - обновление профиля (только свой профиль)
  @Put('profile/:id')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = req.user;
    this.checkUserAccess(id, user.sub, user.isAdmin);

    const updatedUser = await this.usersService.update(id, updateUserDto);
    const userResponse: UserResponse = toUserResponse(updatedUser);

    return {
      message: 'Profile updated successfully',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - добавление в избранное (только свое избранное)
  @Post('favorites/:userId/:movieId')
  @UseGuards(AuthGuard)
  async addToFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = req.user;
    this.checkUserAccess(userId, user.sub, user.isAdmin);

    const updatedUser = await this.usersService.addToFavorites(userId, movieId);
    const userResponse: UserResponse = toUserResponse(updatedUser);

    return {
      message: 'Movie added to favorites',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - удаление из избранного (только свое избранное)
  @Delete('favorites/:userId/:movieId')
  @UseGuards(AuthGuard)
  async removeFromFavorites(
    @Param('userId') userId: string,
    @Param('movieId') movieId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    user: UserResponse;
  }> {
    const user = req.user;
    this.checkUserAccess(userId, user.sub, user.isAdmin);

    const updatedUser = await this.usersService.removeFromFavorites(
      userId,
      movieId,
    );
    const userResponse: UserResponse = toUserResponse(updatedUser);

    return {
      message: 'Movie removed from favorites',
      user: userResponse,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - получение избранного (только свое избранное)
  @Get('favorites/:userId')
  @UseGuards(AuthGuard)
  async getFavorites(
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
    favorites: FavoriteResponse[];
  }> {
    const user = req.user;
    this.checkUserAccess(userId, user.sub, user.isAdmin);

    const favorites = await this.usersService.getFavorites(userId);

    const favoritesResponse: FavoriteResponse[] = favorites.map((movie) => ({
      id: movie._id.toString(),
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      poster: movie.poster,
      rating: movie.rating,
      duration: movie.duration,
    }));

    return {
      message: 'Favorites retrieved successfully',
      favorites: favoritesResponse,
    };
  }

  // ✅ АДМИНСКИЙ - получение всех пользователей
  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async getAllUsers(): Promise<{
    message: string;
    users: UserResponse[];
  }> {
    const users = await this.usersService.findAll();
    const usersResponse: UserResponse[] = users.map((user) =>
      toUserResponse(user),
    );

    return {
      message: 'Users retrieved successfully',
      users: usersResponse,
    };
  }

  // ✅ АДМИНСКИЙ - количество пользователей
  @Get('count')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async getUsersCount(): Promise<{
    message: string;
    count: number;
  }> {
    const countResult = await this.usersService.getCount();
    const count: number = typeof countResult === 'number' ? countResult : 0;

    return {
      message: 'Users count retrieved successfully',
      count,
    };
  }

  // ✅ ЗАЩИЩЕННЫЙ - удаление пользователя (админ или сам пользователь)
  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async deleteUser(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    message: string;
  }> {
    const user = req.user;
    if (user.sub !== id && !user.isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }

  // 🔒 Вспомогательный метод для проверки прав доступа (обновленный)
  private checkUserAccess(
    targetUserId: string,
    currentUserId: string,
    isAdmin: boolean = false,
  ) {
    if (targetUserId !== currentUserId && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }
  }
}

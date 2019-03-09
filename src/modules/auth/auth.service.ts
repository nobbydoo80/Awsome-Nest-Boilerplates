import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../user/user.service';
import { UserDto } from './dto/UserDto';
import { ContextService } from '../../providers/context.service';

@Injectable()
export class AuthService {
    private static _authUserKey = 'user_key';

    constructor(
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly userService: UserService,
    ) { }

    async createToken(user: UserEntity | UserDto) {
        return {
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ id: user.id }),
        };
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
        const user = await this.userService.findUser({ email: userLoginDto.email }, true);
        const isPasswordValid = await UtilsService.validateHash(userLoginDto.password, user && user.passwordHash);
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }

    setAuthUser(user: UserEntity) {
        return AuthService.setAuthUser(user);
    }

    getAuthUser() {
        return AuthService.getAuthUser();
    }

    static setAuthUser(user: UserEntity) {
        ContextService.set(AuthService._authUserKey, user);
    }

    static getAuthUser(): UserEntity {
        return ContextService.get(AuthService._authUserKey);
    }
}

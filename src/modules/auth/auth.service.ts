import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '../config/config.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { UtilsService } from '../../providers/utils.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        public readonly jwtService: JwtService,
        public readonly configService: ConfigService,
        public readonly userService: UserService,
        public readonly utilsService: UtilsService,
    ) { }

    async createToken(user: UserEntity) {
        return {
            expiresIn: this.configService.getNumber('JWT_EXPIRATION_TIME'),
            accessToken: this.jwtService.sign({ id: user.id }),
        };
    }

    async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
        const user = await this.userService.findUser({ email: userLoginDto.email }, true);
        const isPasswordValid = await this.utilsService.validateHash(userLoginDto.password, user && user.passwordHash);
        if (!user || !isPasswordValid) {
            throw new UserNotFoundException();
        }
        return user;
    }
}

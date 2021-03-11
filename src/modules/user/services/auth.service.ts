import { config, decrypt, EnviromentType, environment, time } from '@/core';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { FastifyRequest as Request } from 'fastify';
import { ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';
import { CaptchaActionType, CaptchaType } from '../constants';
import { CaptchaValidateDto } from '../dtos';
import { CaptchaEntity, UserEntity } from '../entities';
import { UserRepository } from '../repositories';
import { UserConfig } from '../types';
import { TokenService } from './token.service';
import { UserService } from './user.service';

/**
 * 用户认证服务
 *
 * @export
 * @class AuthService
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * 用户登录验证
     *
     * @param {string} credential
     * @param {string} password
     * @return {*}
     * @memberof AuthService
     */
    async validateUser(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(
            credential,
            async (query) => query.addSelect('user.password'),
        );
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 登录用户,并生成新的token和refreshToken
     *
     * @param {UserEntity} user
     * @returns
     * @memberof AuthService
     */
    async login(user: UserEntity) {
        const now = time();
        const { accessToken } = await this.tokenService.generateAccessToken(
            user,
            now,
        );
        return accessToken.value;
    }

    /**
     * 注销登录
     *
     * @param {Request} req
     * @returns
     * @memberof AuthService
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
            req as any,
        );
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 通过验证码注册
     *
     * @param {CaptchaValidateDto} data
     * @param {CaptchaType} type
     * @return {*}
     * @memberof AuthService
     */
    async register(data: CaptchaValidateDto, type: CaptchaType) {
        const checked = await this.checkCodeExpired(
            data,
            type,
            CaptchaActionType.REGISTRATION,
        );
        if (checked) {
            throw new BadRequestException('验证码过期!');
        }
        const user = new UserEntity();
        user.actived = true;
        if (type === CaptchaType.EMAIL) user.email = data.email;
        if (type === CaptchaType.PHONE) user.phone = data.phone;
        await user.save();
        return this.userService.findOneById(user.id);
    }

    /**
     * 通过验证码重置密码
     *
     * @param {CaptchaValidateDto} data
     * @param {CaptchaType} type
     * @return {*}
     * @memberof AuthService
     */
    async resetPassword(data: CaptchaValidateDto, type: CaptchaType) {
        const { phone, email, password } = data;
        const checked = await this.checkCodeExpired(
            data,
            type,
            CaptchaActionType.RESETPASSWORD,
        );
        if (checked) {
            throw new BadRequestException('验证码过期!');
        }
        const conditional = CaptchaType.EMAIL ? { email } : { phone };
        const user = (await this.userService.findOneByCondition(conditional))!;
        user.password = password;
        await this.userRepository.save(user);
        return this.userService.findOneById(user.id);
    }

    /**
     * 检测验证码是否过期
     *
     * @protected
     * @param {CaptchaValidateDto} data
     * @param {CaptchaType} type
     * @param {string} template
     * @return {*}
     * @memberof AuthService
     */
    protected async checkCodeExpired(
        data: CaptchaValidateDto,
        type: CaptchaType,
        action: CaptchaActionType,
    ) {
        const { phone, email, code } = data;
        const codeItem = await this.captchaRepository.findOne({
            where: {
                code,
                value: type === CaptchaType.EMAIL ? email : phone,
                type,
            },
        });
        if (!codeItem) {
            throw new ForbiddenException('验证码错误!');
        }
        const template = config<CaptchaTemplate[]>('user.captchas').find(
            (c) => c.action === action && c.type === type,
        );
        if (!template) return false;
        return time({ date: codeItem.created_at })
            .add(template.expired, 'second')
            .isBefore(time());
    }

    /**
     * 导入Jwt模块
     *
     * @static
     * @returns
     * @userof AuthService
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: () => {
                const data = config<UserConfig['jwt']>('user.jwt');
                return {
                    secret: data.secret,
                    ignoreExpiration: environment() === EnviromentType.DEV,
                    signOptions: { expiresIn: `${data.token_expired}s` },
                };
            },
        });
    }
}

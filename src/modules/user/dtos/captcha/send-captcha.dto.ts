import { IsMatchPhone, IsModelExist, IsUnique } from '@/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail } from 'class-validator';
import { UserEntity } from '../../entities';

/**
 * 通过短信或邮件发送用户注册或重置密码的验证码
 *
 * @export
 * @class SendCaptchaDto
 */
export class SendCaptchaDto {
    @ApiProperty({ description: '手机号' })
    @IsDefined({
        message: '手机号必须填写',
        groups: ['phone-registration', 'phone-reset-password'],
    })
    @IsUnique(
        { entity: UserEntity },
        {
            message: '手机号已被注册',
            groups: ['phone-registration'],
        },
    )
    @IsModelExist(
        { entity: UserEntity, map: 'phone' },
        { message: '用户不存在', groups: ['phone-reset-password'] },
    )
    @IsMatchPhone(
        undefined,
        { strictMode: true },
        {
            message: '手机格式错误,示例: 15005255555或+86.15005255555',
            groups: ['phone-registration', 'phone-reset-password'],
        },
    )
    phone!: string;

    @ApiProperty({ description: '邮箱地址' })
    @IsDefined({
        message: '邮箱地址必须填写',
        groups: ['email-registration', 'email-reset-password'],
    })
    @IsUnique(
        { entity: UserEntity },
        {
            message: '邮箱已被注册',
            groups: ['email-registration'],
        },
    )
    @IsModelExist(
        { entity: UserEntity, map: 'email' },
        { message: '用户不存在', groups: ['email-reset-password'] },
    )
    @IsEmail(undefined, {
        message: '邮箱地址格式错误',
        groups: ['email-registration', 'email-reset-password'],
    })
    email!: string;
}

import { IsMatch, IsPassword } from '@/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumberString, Length, MinLength } from 'class-validator';
import { SendCaptchaDto } from './send-captcha.dto';

/**
 * 对用户注册与重置密码的验证码进行校验
 *
 * @export
 * @class CaptchaValidateDto
 * @extends {SendCaptchaDto}
 */
export class CaptchaValidateDto extends SendCaptchaDto {
    @ApiProperty({ description: '密码' })
    @IsDefined({ message: '密码必须填写' })
    @IsPassword(1, { message: '密码必须包含数字和英文字母' })
    @MinLength(8, { message: `密码长度至少为8个字符` })
    password!: string;

    @ApiProperty({ description: '重复密码' })
    @IsDefined({ message: '确认密码必须填写' })
    @IsMatch('password', { message: '两次输入密码不同' })
    plainPassword!: string;

    @ApiProperty({ description: '验证码' })
    @IsNumberString(undefined, { message: '验证码必须为数字' })
    @Length(6, 6, { message: '验证码长度错误' })
    code!: string;
}

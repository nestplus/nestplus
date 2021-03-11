import { DtoValidation } from '@/core';
import { Injectable } from '@nestjs/common';
import { PickType } from '@nestjs/swagger';
import { CaptchaValidateDto } from './captcha-validate.dto';
import { SendCaptchaDto } from './send-captcha.dto';

export { CaptchaValidateDto, SendCaptchaDto };
/**
 * 发送注册验证码短信
 *
 * @export
 * @class SendRegistrationSmsDto
 */
@Injectable()
@DtoValidation({ groups: ['phone-registration'] })
export class SendRegistrationSmsDto extends PickType(SendCaptchaDto, [
    'phone',
] as const) {}

/**
 * 发送注册验证码邮件
 *
 * @export
 * @class SendRegistrationEamilDto
 */
@Injectable()
@DtoValidation({ groups: ['email-registration'] })
export class SendRegistrationEmailDto extends PickType(SendCaptchaDto, [
    'email',
] as const) {}

/**
 * 通过手机号注册
 *
 * @export
 * @class RegisterByPhoneDto
 * @extends {PickType(CaptchaValidateDto, [
 *     'phone',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['phone-registration'] })
export class RegisterByPhoneDto extends PickType(CaptchaValidateDto, [
    'phone',
] as const) {}

/**
 * 通过邮箱地址重置密码
 *
 * @export
 * @class RegisterByEmailDto
 * @extends {PickType(CaptchaValidateDto, [
 *     'email',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['email-registration'] })
export class RegisterByEmailDto extends PickType(CaptchaValidateDto, [
    'email',
] as const) {}

/**
 * 发送重置密码短信
 *
 * @export
 * @class SendRestPasswordSmsDto
 * @extends {PickType(SendCaptchaDto, [
 *     'phone',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['phone-reset-password'] })
export class SendRestPasswordSmsDto extends PickType(SendCaptchaDto, [
    'phone',
] as const) {}

/**
 * 发送重置密码邮件
 *
 * @export
 * @class SendRestPasswordEmailDto
 * @extends {PickType(SendCaptchaDto, [
 *     'email',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['email-reset-password'] })
export class SendRestPasswordEmailDto extends PickType(SendCaptchaDto, [
    'email',
] as const) {}

/**
 * 通过手机号重置密码
 *
 * @export
 * @class RestPasswordByPhoneDto
 * @extends {PickType(CaptchaValidateDto, [
 *     'phone',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['phone-reset-password'] })
export class RestPasswordByPhoneDto extends PickType(CaptchaValidateDto, [
    'phone',
] as const) {}

/**
 * 通过短信重置密码
 *
 * @export
 * @class ResetPasswordByEmailDto
 * @extends {PickType(CaptchaValidateDto, [
 *     'email',
 * ] as const)}
 */
@Injectable()
@DtoValidation({ groups: ['email-reset-password'] })
export class ResetPasswordByEmailDto extends PickType(CaptchaValidateDto, [
    'email',
] as const) {}

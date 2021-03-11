import { config, Configure, time } from '@gkr/core';
import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { classToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { SEND_CAPTCHA_QUEUE } from '../constants';
import { SendRegistrationSmsDto } from '../dtos';
import { CaptchaEntity } from '../entities';

/**
 * 验证码发送服务
 *
 * @export
 * @class SendValidationService
 */
@Injectable()
export class SendValidationService {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        @InjectQueue(SEND_CAPTCHA_QUEUE) private captchaQueue: Queue,
        protected configure: Configure,
    ) {}

    /**
     * 发送短信验证
     *
     * @param {SendRegistrationSmsDto} body
     * @param {ValidateCodeType} type
     * @memberof SendValidationService
     */
    async sendSms(body: SendRegistrationSmsDto, type: ValidateCodeType) {
        const { phone } = body;
        const template = config<MsmValidatorTemplate>(
            `user.validator.sms.templates.${type}`,
        );
        if (!template) {
            throw new BadRequestException('目前无法发送短信');
        }

        try {
            const validator = await this.createSmsValidator(phone, type);
            await this.SmsValidatorQueue.add('sms', {
                ...classToPlain(validator),
                template,
            });
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    /**
     * 创建短信验证模型对象
     *
     * @protected
     * @param {string} phone
     * @param {ValidateCodeType} type
     * @returns
     * @memberof ValidatorService
     */
    protected async createSmsValidator(phone: string, type: ValidateCodeType) {
        const validator = await this.SmsValidatorRepository.findOne({
            phone,
            type,
        });
        const code = generateValidateCode();
        if (!validator) {
            return this.SmsValidatorRepository.create({ phone, type, code });
        }
        const limit =
            this.configure.get<number>(
                'user.sms.templates.registration.limit',
            ) ?? 60;
        const now = time();
        if (
            now.isBefore(
                time({ date: validator.updated_at }).add(limit, 'second'),
            )
        ) {
            throw new Error(`${limit}秒内不可重复发送`);
        }
        validator.code = code;
        return validator;
    }
}

import { MailerUtil, MailSendParams, SmsUtil } from '@/core';
import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';
import {
    CaptchaActionType,
    CaptchaType,
    SEND_CAPTCHA_PROCESS,
    SEND_CAPTCHA_QUEUE,
} from '../constants';
import { CaptchaEntity } from '../entities';
import {
    EmailCaptchaOption,
    SendCaptchaQueueJob,
    SmsCaptchaOption,
} from '../types';

/**
 * 发送验证码的列队任务消费者
 *
 * @export
 * @class SendValidationProcessor
 */
@Processor(SEND_CAPTCHA_QUEUE)
export class SendCaptchaProcessor {
    constructor(
        private readonly sms: SmsUtil,
        private readonly mailer: MailerUtil,
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
    ) {}

    @Process(SEND_CAPTCHA_PROCESS)
    async sendHandler(job: Job<SendCaptchaQueueJob>) {
        this.sendCode(job);
    }

    protected async sendCode(job: Job<SendCaptchaQueueJob>) {
        const { item, option } = job.data;
        const { type } = item;
        try {
            if (type === CaptchaType.PHONE) {
                await this.sendSms(item, option as SmsCaptchaOption);
            }
            if (type === CaptchaType.EMAIL) {
                await this.sendEmail(item, option as EmailCaptchaOption);
            }
            return await this.captchaRepository.save(item);
        } catch (err) {
            throw new Error(err);
        }
    }

    protected sendSms(
        { value, code }: CaptchaEntity,
        { template, driver }: SmsCaptchaOption,
    ) {
        return this.sms.send(
            {
                numbers: [value],
                template,
                vars: { code },
            },
            driver,
        );
    }

    protected sendEmail(
        { value, action }: CaptchaEntity,
        { template, driver, subject }: EmailCaptchaOption,
    ) {
        const name =
            action === CaptchaActionType.REGISTRATION
                ? 'signup'
                : 'reset-password';
        return this.mailer.send<MailSendParams & { template?: string }>(
            {
                name,
                subject,
                template,
                html: !template,
                to: [value],
            },
            driver,
        );
    }
}

import { ConfigRegister, env, MailConfig } from '@/core';
import path from 'path';

export const mail: ConfigRegister<MailConfig> = () => ({
    default: env('EMAIL_DEFAULT', 'smtp'),
    enabled: ['qcloud'],
    connections: [
        {
            name: 'smtp',
            type: 'SMTP',
            option: {
                host: env('MAIL_HOST', 'localhost'),
                user: env('MAIL_USER', 'test'),
                password: env('MAIL_PASS', ''),
                from: env('MAIL_FROM', 'NanGongMo<support@localhost>'),
                port: env('MAIL_PORT', (v) => Number(v), 25),
                secure: env('MAIL_SSL', (v) => JSON.parse(v), false),
                // Email模板路径
                resource: path.resolve(__dirname, '../../assets/emails'),
            },
        },
        {
            name: 'qcloud',
            type: 'QCLOUD',
            option: {
                secretId: env('MAIL_QCLOUD_ID', 'your-secret-id'),
                secretKey: env('MAIL_QCLOUD_KEY', 'your-secret-key'),
                from: env('MAIL_QCLOUD_FROM', 'support@gkr.io'),
                resource: path.resolve(__dirname, '../../assets/emails'),
            },
        },
    ],
});

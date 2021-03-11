import { ConfigRegister, env } from '@/core';
import { CommentEntity, PostEntity } from '@/modules/content/entities';
import { UserConfig } from '@/modules/user';
import { CaptchaActionType } from '@/modules/user/constants';
import { OneToMany } from 'typeorm';

/**
 * 用户模块配置
 */
export const user: ConfigRegister<UserConfig> = () => ({
    hash: 10,
    jwt: {
        secret: env('AUTH_TOKEN_SECRET', 'my-secret'),
        token_expired: env('AUTH_TOKEN_EXPIRED', 3600),
        refresh_secret: env('AUTH_REFRESH_TOKEN_SECRET', 'my-refresh-secret'),
        refresh_token_expired: env('AUTH_REFRESH_TOKEN_EXPIRED', 3600 * 30),
    },
    captchas: {
        common: {
            limit: 60,
            expired: 60 * 60,
        },
        phone: [
            {
                template: env('SMS_REGISTRION_CAPTCHA', 'your-id'),
                action: CaptchaActionType.REGISTRATION,
            },
            {
                template: env('SMS_RESETPASSWORD_CAPTCHA', 'your-id'),
                action: CaptchaActionType.RESETPASSWORD,
            },
        ],
        email: [
            {
                subject: '【用户注册】验证码',
                action: CaptchaActionType.REGISTRATION,
            },
            {
                subject: '【重置密码】验证码',
                action: CaptchaActionType.RESETPASSWORD,
            },
        ],
    },
    relations: [
        {
            column: 'posts',
            relation: OneToMany(
                () => PostEntity,
                (post) => post.author,
                {
                    cascade: true,
                },
            ),
        },
        {
            column: 'comments',
            relation: OneToMany(
                () => CommentEntity,
                (comment) => comment.creator,
                {
                    cascade: true,
                },
            ),
        },
    ],
});

import { DynamicRelation } from '@/core';
import { CaptchaActionType, CaptchaType } from './constants';
import { CaptchaEntity } from './entities';

/** ************************************ 模块配置 ******************************** */
/**
 * 用户模块配置
 *
 * @export
 * @interface UserConfig
 */
export interface UserConfig {
    hash?: number;
    jwt: JwtConfig;
    captchas?: {
        common?: { limit?: number; expired?: number };
        [CaptchaType.PHONE]?: SmsCaptchaOption[];
        [CaptchaType.EMAIL]?: EmailCaptchaOption[];
    };
    relations: DynamicRelation[];
}

/** ************************************ 认证 ******************************** */

/**
 * JWT配置
 *
 * @export
 * @interface JwtConfig
 */
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}

/**
 * JWT荷载
 *
 * @export
 * @interface JwtPayload
 */
export interface JwtPayload {
    sub: string;
    iat: number;
}

/**
 * 由JWT策略解析荷载后存入Rquest.user的对象
 *
 * @export
 * @interface RequestUser
 */
export interface RequestUser {
    id: string;
}

/** ************************************ 验证码 ******************************** */

/**
 * 短信验证码模板
 *
 * @export
 * @interface SmsCaptchaOption
 */
interface CaptchaOption {
    limit?: number;
    expired?: number;
    action: CaptchaActionType;
    driver?: string;
}

export interface SmsCaptchaOption extends CaptchaOption {
    template: string;
}

export interface EmailCaptchaOption extends CaptchaOption {
    subject: string;
    template?: string;
}

export interface SendCaptchaQueueJob {
    item: CaptchaEntity;
    option: SmsCaptchaOption | EmailCaptchaOption;
}

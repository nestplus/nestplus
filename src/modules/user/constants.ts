/**
 * 排序方式
 *
 * @export
 * @enum {number}
 */
export enum UserOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
}

export enum CaptchaType {
    PHONE = 'phone',
    EMAIL = 'email',
}

export enum CaptchaActionType {
    REGISTRATION = 'registration',
    RESETPASSWORD = 'reset-password',
}

/**
 * 判断资源所属的装饰器常量
 */
export const OWNER_RESOURCE = 'onwer-resource';

export const SEND_CAPTCHA_QUEUE = 'send-captcha-queue';

export const SEND_CAPTCHA_PROCESS = 'send-captcha-process';

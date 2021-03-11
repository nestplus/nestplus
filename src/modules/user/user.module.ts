import { DbPluginOption, PluginModule, QueuePluginOption } from '@/core';
import { SEND_CAPTCHA_QUEUE } from './constants';
import * as entities from './entities';
import { SendCaptchaProcessor } from './processors/send-captcha.processor';
import * as repositories from './repositories';
import * as subscribers from './subscribers';
@PluginModule<DbPluginOption & QueuePluginOption>(() => ({
    queue: {
        producers: [{ name: SEND_CAPTCHA_QUEUE }],
        consumers: [SendCaptchaProcessor],
    },
    database: {
        entities: Object.values(entities),
        repositories: Object.values(repositories),
        subscribers: Object.values(subscribers),
    },
}))
export class UserModule {}

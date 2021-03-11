import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as configs from './configs';
import {
    ApiUtil,
    App,
    db,
    DbUtil,
    echoApi,
    HashUtil,
    HtmlUtil,
    MailerUtil,
    restful,
    run,
    SmsUtil,
    TimeUtil,
} from './core';
import { ContentModule } from './modules/content';
import { UserModule } from './modules/user';
import { api } from './routes';

const creator = App.create({
    configs: { ...configs, api },
    plugins: [UserModule, ContentModule],
    factory: async ({ BootModule }) => {
        const instance = await NestFactory.create<NestFastifyApplication>(
            BootModule,
            new FastifyAdapter(),
            {
                cors: true,
                logger: ['error', 'warn'],
            },
        );
        return instance;
    },
    hooks: {
        inited: ({ utiler }) =>
            utiler.add(
                TimeUtil,
                DbUtil,
                ApiUtil,
                HtmlUtil,
                HashUtil,
                SmsUtil,
                MailerUtil,
            ),
        registerPlugin: ({ plugin, meta }) => db().loadPluginMeta(plugin, meta),
        created: ({ current, utiler }) =>
            utiler.get(ApiUtil).registerDocs(current),
        listend: ({ configure, utiler }) => echoApi({ configure, utiler }),
        closed: async () => db().close(),
    },
    meta: {
        global: () => {
            const dbMeta = db().getGlobalMeta();
            const restfulMeta = restful().getGlobalMeta();
            return {
                imports: [...dbMeta.imports, ...restfulMeta.imports],
            };
        },
        plugin: ({ plugin }) => db().getPluginMeta(plugin),
    },
    commands: () => db().getCommands(),
});
run(creator);

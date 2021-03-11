import { INestApplication } from '@nestjs/common';
import { useContainer } from 'typeorm';
import { Configure } from '../configure/configure';
import { ConfigRegCollection } from '../configure/types';
import { PLUGIN_MODULE_REGISTER } from './constants';
import { buildCommands, createBootModule } from './factory';
import { AppParams, CreateOptions, Creator, PluginModuleMeta } from './types';
import { Utiler } from './utiler';

/**
 * App构造器
 *
 * @export
 * @class App
 */
export class App {
    /**
     * 当前创建的APP实例
     *
     * @protected
     * @static
     * @type {INestApplication}
     * @memberof App
     */
    protected static current: INestApplication;

    /**
     * 初始化后配置器实例
     *
     * @protected
     * @static
     * @type {Configure}
     * @memberof App
     */
    protected static _configure: Configure;

    /**
     * Utiler管理器实例
     *
     * @protected
     * @static
     * @type {Utiler}
     * @memberof App
     */
    protected static _utiler: Utiler;

    /**
     * 实例化Configure并根据配置初始化
     *
     * @protected
     * @static
     * @param {ConfigRegCollection<Record<string, any>>} configs
     * @memberof App
     */
    protected static config(configs: ConfigRegCollection<Record<string, any>>) {
        this._configure = new Configure();
        this._configure.create(configs);
        this._utiler = new Utiler(this._configure);
    }

    /**
     * 获取初始化后Configure实例
     *
     * @readonly
     * @static
     * @memberof App
     */
    static get configure() {
        return this._configure;
    }

    /**
     * 获取Util管理器
     *
     * @readonly
     * @static
     * @memberof App
     */
    static get utiler() {
        return this._utiler;
    }

    /**
     * 获取当前app实例
     *
     * @static
     * @return {*}
     * @memberof App
     */
    static get(): INestApplication {
        return this.current;
    }

    /**
     * 根据选项参数返回App构造器函数
     *
     * @static
     * @param {CreateOptions} createOptions
     * @return {*}  {Creator}
     * @memberof App
     */
    static create(createOptions: CreateOptions): Creator {
        return async () => {
            const {
                configs,
                meta,
                factory,
                hooks,
                commands,
                plugins = [],
            } = createOptions;
            try {
                this.config(configs);
                const params: AppParams = {
                    configure: this._configure,
                    utiler: this._utiler,
                };
                if (hooks?.inited) {
                    await hooks.inited(params);
                }
                const pluginsLoaded = plugins.map((plugin) => {
                    const metaRegister = Reflect.getMetadata(
                        PLUGIN_MODULE_REGISTER,
                        plugin,
                    );
                    const pluginMeta: PluginModuleMeta = metaRegister
                        ? metaRegister()
                        : {};
                    if (hooks?.registerPlugin) {
                        hooks.registerPlugin({
                            ...params,
                            plugin,
                            meta: pluginMeta,
                        });
                    }
                    return { use: plugin, meta: pluginMeta };
                });
                const BootModule = createBootModule(
                    params,
                    meta,
                    pluginsLoaded,
                );
                this.current = await factory({
                    configure: this._configure,
                    BootModule,
                });
                this.current.enableShutdownHooks();
                await this.current.init();
                useContainer(this.current.select(BootModule), {
                    fallbackOnErrors: true,
                });
                if (hooks?.created) {
                    this.current = await hooks.created({
                        ...params,
                        current: this.current,
                    });
                }
            } catch (error) {
                throw new Error(error);
            }
            return {
                configure: this._configure,
                utiler: this._utiler,
                current: this.current,
                hooks,
                commands,
            };
        };
    }
}

/**
 * 构造App并创建命令
 *
 * @export
 * @param {Creator} creator
 */
export async function run(creator: Creator) {
    const { commands, ...others } = await creator();
    buildCommands(others, commands ? commands() : []);
}

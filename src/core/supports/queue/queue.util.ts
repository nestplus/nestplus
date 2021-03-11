import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { DynamicModule, ModuleMetadata, Type } from '@nestjs/common';
import { omit } from 'lodash';
import { App, BaseUtil, PluginModuleMeta, UtilConfigMaps } from '../../common';
import { RedisUtil } from '../redis';
import { QueueConfig, QueueOption, QueuePluginOption } from './types';

/**
 * 列队设置
 *
 * @export
 * @class Redis
 * @extends {BasePlugin<RedisModuleOptions[]>}
 */
export class QueueUtil extends BaseUtil<QueueOption[]> {
    /**
     * 配置映射
     *
     * @protected
     * @type {IConfigMaps}
     * @memberof Redis
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'redis',
    };

    protected _pluginMeta: Array<{
        module: Type<any>;
        meta: Required<Pick<ModuleMetadata, 'imports' | 'providers'>>;
    }> = [];

    /**
     * 默认配置名
     *
     * @protected
     * @type {string}
     * @memberof Redis
     */
    protected _default!: string;

    /**
     * 所有配置名
     *
     * @protected
     * @type {string[]}
     * @memberof Redis
     */
    protected _names: string[] = [];

    /**
     * 获取默认配置名称
     *
     * @returns
     * @memberof Database
     */
    get default() {
        return this._default;
    }

    /**
     * 获取所有配置名
     *
     * @returns
     * @memberof Database
     */
    get names() {
        return this._names;
    }

    /**
     * 获取所有配置
     *
     * @returns
     * @memberof Redis
     */
    getOptions() {
        return this.config;
    }

    /**
     * 获取单个配置
     *
     * @param {string} [name]
     * @returns
     * @memberof Redis
     */
    getOption(name?: string) {
        const findName: string | undefined = name ?? this._default;
        const option = this.getOptions().find((item) => item.name === findName);
        if (!option) {
            throw new Error(
                `Connection named ${findName}'s option not exists!`,
            );
        }
        return option;
    }

    getGlobalMeta() {
        const redis = App.utiler.get(RedisUtil);
        return {
            imports: () =>
                this.config.map((connection) => {
                    if (
                        connection.redis &&
                        !redis.names.includes(connection.redis)
                    ) {
                        throw new Error(
                            `Redis connection config named ${connection.redis} not exists!`,
                        );
                    }
                    return BullModule.forRoot(connection.name, {
                        redis: redis.getOption(connection.redis),
                        ...omit(connection, ['name', 'redis']),
                    });
                }),
        };
    }

    getPluginMeta(plugin: Type): Omit<ModuleMetadata, 'controllers'> {
        const item = this._pluginMeta.find((p) => p.module === plugin);
        return item ? item.meta : {};
    }

    loadPluginMeta(
        pluginModule: Type,
        pluginMeta: PluginModuleMeta<QueuePluginOption>,
    ) {
        let producers: DynamicModule[] = [];
        let consumers: Type<any>[] = [];
        const { queue } = pluginMeta;
        if (queue?.producers) {
            queue.producers.forEach((option) => {
                if (
                    option.configKey &&
                    !this._names.includes(option.configKey)
                ) {
                    throw new Error(
                        `Queue connection config named ${option.configKey} not exists!`,
                    );
                }
            });
            producers = queue.producers.map((option) =>
                BullModule.registerQueue({
                    ...option,
                    configKey: option.configKey ?? this._default,
                }),
            );
        }
        if (queue?.consumers) {
            consumers = queue.consumers;
        }
        this._pluginMeta.push({
            module: pluginModule,
            meta: { imports: producers, providers: consumers },
        });
    }

    addProducers(...producers: BullModuleOptions[]) {
        producers.forEach((option) => {
            if (option.configKey && !this._names.includes(option.configKey)) {
                throw new Error(
                    `Queue connection config named ${option.configKey} not exists!`,
                );
            }
        });

        return producers.map((option) =>
            BullModule.registerQueue({
                ...option,
                configKey: option.configKey ?? this._default,
            }),
        );
    }

    /**
     * 创建配置
     *
     * @param {RedisConfig} config
     * @memberof Redis
     */
    create(config: QueueConfig) {
        // 如果没有默认配置则抛出异常
        if (!config.default) {
            throw new Error(
                'default queue connection name should been config!',
            );
        }
        this.config = config.connections.filter((connect) => {
            if (!connect.name) return false;
            if (config.default === connect.name) return true;
            return config.enabled.includes(connect.name);
        });
        // 把启用的配置名写入this.names
        this.config.forEach((connect) => this._names.push(connect.name!));
        this._default = config.default;
        // 如果启用的配置名中不包含默认配置名则抛出异常
        if (!this._names.includes(this._default)) {
            throw new Error(
                `Default queue connection named ${this._default} not exists!`,
            );
        }
    }
}

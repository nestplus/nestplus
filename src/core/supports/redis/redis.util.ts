import { ModuleMetadata } from '@nestjs/common';
import IORedis from 'ioredis';
import { RedisModule, RedisModuleOptions, RedisService } from 'nestjs-redis';
import { BaseUtil, UtilConfigMaps } from '../../common';
import { RedisConfig } from './types';

/**
 * Redis扩展
 *
 * @export
 * @class RedisUtil
 * @extends {BaseUtil<RedisModuleOptions[]>}
 */
export class RedisUtil extends BaseUtil<RedisModuleOptions[]> {
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'redis',
    };

    /**
     * 外部注入的nestjs-redis服务
     *
     * @private
     * @type {RedisService}
     * @memberof Redis
     */
    private redis!: RedisService;

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

    /**
     * 设置nestjs-redis服务
     *
     * @param {RedisService} redis
     * @returns {Redis}
     * @memberof Redis
     */
    setRedisService(redis: RedisService): RedisUtil {
        this.redis = redis;
        return this;
    }

    /**
     * 根据名称创建客户端连接
     *
     * @param {string} [name]
     * @returns {IORedis.Redis}
     * @memberof Redis
     */
    getClient(name?: string): IORedis.Redis {
        return this.redis.getClient(name ?? this._default);
    }

    /**
     * 获取所有客户端连接
     *
     * @returns {Map<string, IORedis.Redis>}
     * @memberof Redis
     */
    getClients(): Map<string, IORedis.Redis> {
        return this.redis.getClients();
    }

    getGlobalMeta(): ModuleMetadata {
        return {
            imports: [RedisModule.register(this.getOptions())],
            providers: [
                {
                    provide: RedisUtil,
                    useFactory: (redisService: RedisService) =>
                        this.setRedisService(redisService),
                    inject: [RedisService],
                },
            ],
        };
    }

    /**
     * 创建配置
     *
     * @param {RedisConfig} config
     * @memberof Redis
     */
    create(config: RedisConfig) {
        // 如果没有默认配置则抛出异常
        if (!config.default) {
            throw new Error(
                'default redis connection name should been config!',
            );
        }
        // 只把启用的数据库配置写入this.config
        // Reids配置名必须填写,没有配置名的直接略过
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
                `Default redis connection named ${this._default} not exists!`,
            );
        }
    }
}

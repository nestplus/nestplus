import { Injectable } from '@nestjs/common';
import {
    BaseUtil,
    ClassType,
    NestedRecord,
    UtilConfigMaps,
    ValueOf,
} from '../../common';
import { AliyunSms, QcloudSms } from './drivers';
import { BaseSms } from './drivers/base';
import {
    SmsConfig,
    SmsConnectionOption,
    SmsDriverOptions,
    SmsSendParams,
} from './types';

type DriverList = {
    [key: string]: ClassType<BaseSms<any, any, any>>;
};
type ConnectList = {
    [key in keyof DriverList]: InstanceType<DriverList[key]>;
};

/**
 * 短信发送扩展
 *
 * @export
 * @class SmsUtil
 * @extends {BaseUtil<SmsConfig>}
 */
@Injectable()
export class SmsUtil extends BaseUtil<SmsConfig> {
    /**
     * 驱动类列表
     *
     * @protected
     * @static
     * @type {DriverList}
     * @memberof SmsUtil
     */
    protected static drivers: DriverList = {
        ALIYUN: AliyunSms,
        QCLOUD: QcloudSms,
    };

    /**
     * 配置映射
     *
     * @protected
     * @type {UtilConfigMaps}
     * @memberof SmsUtil
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'sms',
    };

    /**
     * 默认短信驱动
     *
     * @protected
     * @type {string}
     * @memberof SmsUtil
     */
    protected _default!: string;

    /**
     * 已启用的短信驱动类型
     *
     * @protected
     * @type {string[]}
     * @memberof SmsUtil
     */
    protected _enabled!: string[];

    /**
     * 已启用的短信驱动配置
     *
     * @protected
     * @type {SmsConnectionOption[]}
     * @memberof SmsUtil
     */
    protected _options!: SmsConnectionOption[];

    /**
     * 已启用的短信驱动连接实例
     *
     * @protected
     * @type {ConnectList}
     * @memberof SmsUtil
     */
    protected _connections!: ConnectList;

    /**
     *  添加额外的驱动
     *
     * @static
     * @template T
     * @template TC
     * @template TT
     * @template TO
     * @param {string} name
     * @param {ClassType<T>} driver
     * @return {*}
     * @memberof SmsUtil
     */
    static addDriver<
        T extends BaseSms<TC, TT, TO>,
        TC,
        TT,
        TO extends SmsSendParams
    >(name: string, driver: ClassType<T>) {
        this.drivers[name] = driver;
        return this;
    }

    /**
     * 获取驱动
     *
     * @static
     * @return {*}
     * @memberof SmsUtil
     */
    static getDrivers() {
        return this.drivers;
    }

    async send<T extends SmsSendParams>(options: T): Promise<any>;
    async send<T extends SmsSendParams>(
        options: T,
        name?: string,
    ): Promise<any>;
    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        config: ValueOf<SmsDriverOptions<C>>,
    ): Promise<any>;

    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        name: string,
        config: ValueOf<SmsDriverOptions<C>>,
    ): Promise<any>;

    /**
     * 发送短信
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {(string | ValueOf<SmsDriverOptions<C>>)} [name]
     * @param {ValueOf<SmsDriverOptions<C>>} [config]
     * @return {*}
     * @memberof SmsUtil
     */
    async send<T extends SmsSendParams, C extends NestedRecord = {}>(
        options: T,
        name?: string | ValueOf<SmsDriverOptions<C>>,
        config?: ValueOf<SmsDriverOptions<C>>,
    ) {
        let cname = this._default;
        if (name && typeof name === 'string') cname = name;
        const connection = this._connections[cname];
        if (!connection) {
            throw new Error(`Sms connection ${cname} not exists!`);
        }
        if (!name || typeof name === 'string') return connection.send(options);
        if (!config) return connection.send(options, name);
        return connection.send(options, config);
    }

    /**
     * 创建配置
     *
     * @param {SmsConfig} config
     * @memberof SmsUtil
     */
    create(config: SmsConfig) {
        this.config = config;
        this.setDefault().setOptions().setEnabled();
        this._enabled.map((name) => {
            return this._options.find((option) => option.name === name)!.type;
        });
        this._connections = Object.fromEntries(
            this._enabled.map((name) => {
                const { type, option } = this._options.find(
                    (item) => item.name === name,
                )!;
                return [name, new SmsUtil.drivers[type]!(option)];
            }),
        );
    }

    /**
     * 设置所有连接配置
     *
     * @protected
     * @return {*}
     * @memberof SmsUtil
     */
    protected setOptions() {
        this._options = this.config.connections;
        return this;
    }

    /**
     * 设置默认短信驱动
     *
     * @protected
     * @return {*}
     * @memberof SmsUtil
     */
    protected setDefault() {
        if (!this.config.default) {
            const [firstEnabled] = this.config.enabled;
            this._default = firstEnabled;
            return this;
        }
        this._default = this.config.default;
        return this;
    }

    /**
     * 设置已启用的短信驱动
     *
     * @protected
     * @return {*}
     * @memberof SmsUtil
     */
    protected setEnabled() {
        const { enabled } = this.config;
        if (!this._default) {
            throw new Error(
                'Default sms connection or at least one enabled provider should be configure!',
            );
        }
        for (const name of enabled) {
            if (!this._options.map((option) => option.name).includes(name)) {
                throw new Error(
                    `Sms connection ${name} which enabled or default is not been configure!`,
                );
            }
        }
        if (!enabled.includes(this._default)) {
            enabled.push(this._default);
        }
        this._enabled = enabled;
        return this;
    }
}

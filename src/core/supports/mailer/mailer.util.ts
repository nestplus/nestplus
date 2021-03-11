import { Injectable } from '@nestjs/common';
import {
    BaseUtil,
    ClassType,
    NestedRecord,
    UtilConfigMaps,
    ValueOf,
} from '../../common';
import { BaseMailer } from './drivers/base';
import { QcloudMailer } from './drivers/qcloud';
import { SmtpMailer } from './drivers/smtp';
import {
    MailConfig,
    MailConnectionOption,
    MailerOptions,
    MailSendParams,
} from './types';

type DriverList = {
    [key: string]: ClassType<BaseMailer<any, any, any>>;
};
type ConnectList = {
    [key in keyof DriverList]: InstanceType<DriverList[key]>;
};

/**
 * 邮件推送扩展
 *
 * @export
 * @class MailerUtil
 * @extends {BaseUtil<MailConfig>}
 */
@Injectable()
export class MailerUtil extends BaseUtil<MailConfig> {
    /**
     * 驱动列表
     *
     * @protected
     * @static
     * @type {DriverList}
     * @memberof MailerUtil
     */
    protected static drivers: DriverList = {
        SMTP: SmtpMailer,
        QCLOUD: QcloudMailer,
    };

    /**
     * 配置映射
     *
     * @protected
     * @type {UtilConfigMaps}
     * @memberof MailerUtil
     */
    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'mail',
    };

    /**
     * 默认驱动
     *
     * @protected
     * @type {string}
     * @memberof MailerUtil
     */
    protected _default!: string;

    /**
     * 已启用的驱动列表
     *
     * @protected
     * @type {string[]}
     * @memberof MailerUtil
     */
    protected _enabled!: string[];

    /**
     * 启用的驱动配置
     *
     * @protected
     * @type {MailConnectionOption[]}
     * @memberof MailerUtil
     */
    protected _options!: MailConnectionOption[];

    /**
     * 启用的驱动连接
     *
     * @protected
     * @type {ConnectList}
     * @memberof MailerUtil
     */
    protected _connections!: ConnectList;

    async send<T extends MailSendParams>(options: T): Promise<any>;
    async send<T extends MailSendParams>(
        options: T,
        name?: string,
    ): Promise<any>;
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        config: ValueOf<MailerOptions<C>>,
    ): Promise<any>;
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        name: string,
        config: ValueOf<MailerOptions<C>>,
    ): Promise<any>;

    /**
     * 发送邮件
     *
     * @template T
     * @template C
     * @param {T} options
     * @param {(string | ValueOf<MailerOptions<C>>)} [name]
     * @param {ValueOf<MailerOptions<C>>} [config]
     * @return {*}
     * @memberof MailerUtil
     */
    async send<T extends MailSendParams, C extends NestedRecord = {}>(
        options: T,
        name?: string | ValueOf<MailerOptions<C>>,
        config?: ValueOf<MailerOptions<C>>,
    ) {
        let cname = this._default;
        if (name && typeof name === 'string') cname = name;
        const connection = this._connections[cname];
        if (!connection) {
            throw new Error(`Mail connection ${cname} not exists!`);
        }
        if (!name || typeof name === 'string') return connection.send(options);
        if (!config) return connection.send(options, name);
        return connection.send(options, config);
    }

    /**
     * 创建配置和连接
     *
     * @param {MailConfig} config
     * @memberof MailerUtil
     */
    create(config: MailConfig) {
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
                return [name, new MailerUtil.drivers[type]!(option)];
            }),
        );
    }

    /**
     * 设置启用驱动的配置
     *
     * @protected
     * @return {*}
     * @memberof MailerUtil
     */
    protected setOptions() {
        this._options = this.config.connections;
        return this;
    }

    /**
     * 设置默认驱动
     *
     * @protected
     * @return {*}
     * @memberof MailerUtil
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
     * 设置启用的驱动
     *
     * @protected
     * @return {*}
     * @memberof MailerUtil
     */
    protected setEnabled() {
        const { enabled } = this.config;
        if (!this._default) {
            throw new Error(
                'Default mail connection or at least one enabled provider should be configure!',
            );
        }
        for (const name of enabled) {
            if (!this._options.map((option) => option.name).includes(name)) {
                throw new Error(
                    `Mail connection ${name} which enabled or default is not been configure!`,
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

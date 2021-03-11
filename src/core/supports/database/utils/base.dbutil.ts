import { ModuleMetadata, Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import merge from 'deepmerge';
import path from 'path';
import { isInSource } from '../../../common/helpers';
import { UtilConfigMaps } from '../../../common/types';
import { BaseUtil } from '../../../common/utils/base.util';
import { ADDTIONAL_RELATIONS } from '../constants';
import {
    DatabaseConfig,
    DbFactoryOption,
    DbOption,
    DynamicRelation,
    FactoryOptions,
} from '../types';
/**
 * 数据库工具类
 *
 * @export
 * @class DataBasePlugin
 */
export abstract class BaseDbUtil extends BaseUtil<DbOption[]> {
    protected entities: {
        [connectionName: string]: EntityClassOrSchema[];
    } = {};

    protected repositories: EntityClassOrSchema[] = [];

    protected subscribers: {
        [connectionName: string]: Type<any>[];
    } = {};

    protected _factories: FactoryOptions = {};

    protected configMaps: UtilConfigMaps = {
        required: true,
        maps: 'database',
    };

    protected _default!: string;

    protected _names: string[] = [];

    protected _pluginMeta: Array<{
        module: Type<any>;
        meta: Required<Omit<ModuleMetadata, 'controllers'>>;
    }> = [];

    /**
     * 获取默认数据库配置名称
     *
     * @returns
     * @memberof Database
     */
    get default() {
        return this._default;
    }

    /**
     * 获取所有数据库配置名
     *
     * @returns
     * @memberof Database
     */
    get names() {
        return this._names;
    }

    get factories() {
        return this._factories;
    }

    protected defineEntity(entity: EntityClassOrSchema) {
        const relationsRegister = Reflect.getMetadata(
            ADDTIONAL_RELATIONS,
            entity,
        );
        if (
            'prototype' in entity &&
            relationsRegister &&
            typeof relationsRegister === 'function'
        ) {
            const relations: DynamicRelation[] = relationsRegister();
            relations.forEach(({ column, relation }) => {
                const cProperty = Object.getOwnPropertyDescriptor(
                    entity.prototype,
                    column,
                );
                if (!cProperty) {
                    Object.defineProperty(entity.prototype, column, {
                        writable: true,
                    });
                    relation(entity, column);
                }
            });
        }
        return entity;
    }

    protected defineSubsciber(Sub: Type<any>, cname?: string) {
        Object.defineProperty(Sub.prototype, 'cname', {
            value: cname,
            writable: true,
        });
        return Sub;
    }

    /**
     * 创建组件
     *
     * @protected
     * @param {DatabaseConfig} config
     * @memberof DbUtilHook
     */
    protected create(config: DatabaseConfig) {
        // 如果没有配置默认数据库则抛出异常
        if (!config.default) {
            throw new Error(
                'default database connection name should been config!',
            );
        }
        // 只把启用的数据库配置写入this.config
        // 数据库配置名必须填写,没有数据库配置名的直接略过
        this.config = config.connections
            .filter((connect) => {
                if (!connect.name) return false;
                if (config.default === connect.name) return true;
                return config.enabled.includes(connect.name);
            })
            .map((connect) => {
                const common = merge(
                    {
                        paths: {
                            migrations: 'migration',
                        },
                    },
                    config.common,
                );
                return merge(
                    common,
                    connect as Record<string, any>,
                ) as DbOption;
            });
        // 把启用的数据库配置名写入this.names
        this.config.forEach((connect) => {
            this._names.push(connect.name!);
            this.entities[connect.name!] = [];
            this.subscribers[connect.name!] = [];
        });
        this._default = config.default;
        // 如果启用的数据库配置名中不包含默认配置名则抛出异常
        if (!this._names.includes(this._default)) {
            throw new Error(
                `Default database connection named ${this._default} not exists!`,
            );
        }
    }

    /**
     * 获取所有连接配置
     *
     * @template T
     * @returns {T[]}
     * @memberof Database
     */
    getOptions<T extends DbOption = DbOption>(): T[] {
        return this.config.map((option) => {
            const mgPath = path.join(
                option.paths?.migration ?? 'src/database/migration',
                option.name,
            );
            if (option.factories) {
                this.addFactories(option.factories);
            }
            return {
                ...option,
                synchronize: false,
                entities: this.entities[option.name],
                subscribers: this.subscribers[option.name] as any[],
                migrations: isInSource()
                    ? [path.join(mgPath, '**/*{.ts,.js}')]
                    : option.migrations,
            } as T;
        });
    }

    /**
     * 根据名称获取一个数据库连接的配置，可设置类型
     * name不设置的情况下返回默认连接的配置
     *
     * @template T
     * @param {string} [name]
     * @returns {T}
     * @memberof Database
     */
    getOption<T extends DbOption = DbOption>(name?: string): T {
        const findName: string | undefined = name ?? this._default;
        const option = this.getOptions().find((item) => item.name === findName);
        if (!option) {
            throw new Error(
                `Connection named ${findName}'s option not exists!`,
            );
        }
        return option as T;
    }

    /**
     * 获取用于TypeOrmModule的数据库连接的配置
     * 设置autoLoadEntities为true,使entity在autoLoadEntities后自动加载
     * 由于entity在autoLoadEntities后自动加载,subscriber由提供者方式注册
     * 所以在配置中去除这两者
     *
     * @returns
     * @memberof Database
     */
    getNestOptions() {
        const options = this.getOptions().map((option) => {
            const all = {
                ...option,
                keepConnectionAlive: true,
                autoLoadEntities: true,
            };
            const {
                migrations,
                subscribers,
                entities,
                name,
                ...nestOption
            } = all;
            const cname =
                option.name === this._default ? undefined : option.name;
            return {
                ...nestOption,
                name: cname,
                subscribers: (subscribers ?? []).map((s) =>
                    this.defineSubsciber(s as Type<any>, cname),
                ),
            };
        }) as TypeOrmModuleOptions[];
        return options;
    }

    /**
     * 根据名称获取一个用于TypeOrmModule的数据库连接的配置
     * 没有名称则获取默认配置
     *
     * @param {string} [name]
     * @returns
     * @memberof Database
     */
    getNestOption(name?: string) {
        const option = this.getNestOptions().find((item) => item.name === name);
        if (!option) {
            throw new Error(`Connection named ${name}'s option not exists!`);
        }
        return option;
    }

    protected abstract addFactories(
        factories: (() => DbFactoryOption<any, any>)[],
    ): void;
}

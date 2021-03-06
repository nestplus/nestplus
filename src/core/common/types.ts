import { INestApplication, ModuleMetadata, Type } from '@nestjs/common';
import { CommandModule } from 'yargs';
import { Configure } from '../configure/configure';
import { ConfigRegCollection } from '../configure/types';
import { Utiler } from './utiler';
/**
 * 一个类的类型
 */
export type ClassType<T extends {}> = { new (...args: any[]): T };
/**
 * 递归可选
 */
export type RePartial<T> = {
    [P in keyof T]?: RePartial<T[P]>;
};
/**
 * 过滤类型,去除U中T不包含的类型
 */
export type Filter<T, U> = T extends U ? T : never;

/**
 * 反向过滤类型,去除U中T包含的类型
 */
export type Diff<T, U> = T extends U ? never : T;

/**
 * 获取一个对象的值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 获取不同类组成的数组的类型
 */
export type ClassesType<T extends Array<any>> = {
    new (...args: any[]): T[number];
}[];

/**
 * 嵌套对象
 */
export type NestedRecord = Record<string, Record<string, any>>;
/**
 * 分页验证DTO接口
 *
 * @export
 * @interface PaginateDto
 */
export interface PaginateDto {
    page: number;
    limit: number;
}

/**
 * 配置与Util映射
 *
 * @export
 * @interface UtilConfigMaps
 */
export interface UtilConfigMaps {
    required?: boolean | string[];
    maps?: { [key: string]: string } | string;
}

export type AppParams = {
    configure: Configure;
    utiler: Utiler;
    current?: INestApplication;
};

/**
 * 插件模块的元数据配置函数
 *
 * @export
 * @interface PluginMetaGetter
 */
export interface PluginMetaGetter {
    (
        params: AppParams & { plugin: Type<any>; meta: PluginModuleMeta },
    ): PluginModuleMeta;
}
/**
 * APP创建器选项
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
    configs: ConfigRegCollection<Record<string, any>>;
    plugins: Type<any>[];
    factory: AppFactory;
    hooks?: {
        inited?: (params: AppParams) => void | Promise<void>;
        registerPlugin?: (
            params: AppParams & { plugin: Type; meta: PluginModuleMeta },
        ) => void;
        created?: (
            params: Required<AppParams>,
        ) => INestApplication | Promise<INestApplication>;
        listend?: (params: Required<AppParams>) => void;
        closed?: (params: Required<AppParams>) => Promise<void>;
    };
    meta?: {
        global?: (params: AppParams) => ModuleMetadata;
        plugin?: PluginMetaGetter;
        boot?: (params: AppParams) => ModuleMetadata;
    };
    commands?: () => CommandCollection;
}

/**
 * App构造器
 *
 * @export
 * @interface Creator
 */
export interface Creator {
    (): Promise<
        CommandParams & {
            commands?: () => CommandCollection;
        }
    >;
}

/**
 * App实例化函数
 *
 * @export
 * @interface AppFactory
 */
export interface AppFactory {
    (params: {
        configure: Configure;
        BootModule: Type<any>;
    }): Promise<INestApplication>;
}

/**
 * 插件模块的Meta配置
 */
export type PluginModuleMeta<
    T extends Record<string, any> = Record<string, any>
> = ModuleMetadata & T;

export type CommandParams = Required<AppParams> & Pick<CreateOptions, 'hooks'>;

export type CommandItem<T = {}, U = {}> = (
    params: CommandParams,
) => CommandModule<T, U>;

export type CommandCollection = Array<CommandItem<any, any>>;

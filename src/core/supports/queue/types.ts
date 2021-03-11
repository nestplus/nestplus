import { BullModuleOptions } from '@nestjs/bull';
import { Type } from '@nestjs/common';
import Bull from 'bull';

export interface QueuePluginOption {
    queue?: {
        producers?: BullModuleOptions[];
        consumers?: Type<any>[];
    };
}

/**
 * 列队配置
 *
 * @export
 * @interface QueueConfig
 */
export interface QueueConfig {
    default: string;
    enabled: string[];
    connections: Array<QueueOption>;
}

/**
 * 列队连接配置选项
 */
export type QueueOption = Omit<Bull.QueueOptions, 'redis'> & {
    name: string;
    redis?: string;
};

import { RedisModuleOptions } from 'nestjs-redis';

/**
 * Redis配置
 *
 * @export
 * @interface RedisConfig
 */
export interface RedisConfig {
    default: string;
    enabled: string[];
    connections: Array<
        RedisModuleOptions & {
            name: string;
        }
    >;
}

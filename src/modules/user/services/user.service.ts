import { QueryHook } from '@/core';
import { Injectable } from '@nestjs/common';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from '../dtos';
import { UserEntity } from '../entities';
import { UserRepository } from '../repositories';

// 用户查询接口
type FindParams = {
    [key in keyof Omit<QueryUserDto, 'limit' | 'page'>]: QueryUserDto[key];
};

/**
 * 用户管理服务
 *
 * @export
 * @class UserService
 */
@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    /**
     * 创建用户
     *
     * @param {CreateUserDto} data
     * @returns
     * @memberof UserService
     */
    async create(data: CreateUserDto) {
        const user = await this.userRepository.save(data);
        return this.findOneById(user.id);
    }

    /**
     * 更新用户
     *
     * @param {UpdateUserDto} data
     * @returns
     * @memberof UserService
     */
    async update(data: UpdateUserDto) {
        const user = await this.userRepository.save(data);
        return this.findOneById(user.id);
    }

    async delete(item: UserEntity) {
        return this.userRepository.remove(item);
    }

    /**
     * 根据用户用户凭证查询用户
     *
     * @param {string} credential
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneByCredential(
        credential: string,
        callback?: QueryHook<UserEntity>,
    ) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        return query
            .where('user.username = :credential', { credential })
            .orWhere('user.phone = :credential', { credential })
            .orWhere('user.email = :credential', { credential })
            .getOne();
    }

    /**
     * 根据ID查询用户
     *
     * @param {string} id
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneById(id: string, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        const user = await query.where('user.id = :id', { id }).getOne();
        if (!user) {
            throw new EntityNotFoundError(UserEntity, id);
        }
        return user;
    }

    /**
     * 根据对象条件查找用户,不存在则抛出异常
     *
     * @param {{ [key: string]: any }} condition
     * @param {QueryHook<UserEntity>} [callback]
     * @returns
     * @memberof UserService
     */
    async findOneByCondition(
        condition: { [key: string]: any },
        callback?: QueryHook<UserEntity>,
    ) {
        let query = this.userRepository.buildBaseQuery();
        if (callback) {
            query = await callback(query);
        }
        const wheres = Object.fromEntries(
            Object.entries(condition).map(([key, value]) => [
                `user.${key}`,
                value,
            ]),
        );
        const user = query.where(wheres).getOne();
        if (!user) {
            throw new EntityNotFoundError(
                UserEntity,
                Object.keys(condition).join(','),
            );
        }
        return user;
    }

    /**
     * 对查询结果进行分页
     *
     * @param {FindParams} params
     * @param {IPaginationOptions} options
     * @returns
     * @memberof UserService
     */
    async paginate(params: FindParams, options: IPaginationOptions) {
        const query = await this.getListQuery(params);
        return paginate<UserEntity>(query, options);
    }

    /**
     * 根据参数构建查询用户列表的Query
     *
     * @protected
     * @param {FindParams} [params={}]
     * @returns
     * @memberof UserService
     */
    protected async getListQuery(params: FindParams = {}) {
        const { actived, orderBy } = params;
        const condition: { [key: string]: any } = {};
        let query = this.userRepository.buildBaseQuery();
        if (actived !== undefined && typeof actived === 'boolean') {
            condition['user.actived'] = actived;
        }
        if (orderBy) {
            query = query.orderBy(`user.${orderBy}`, 'ASC');
        }
        if (Object.keys(condition).length > 0) {
            query = query.where(condition);
        }
        return query;
    }
}

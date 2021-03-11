import { AddRelations, config, time } from '@/core';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AccessTokenEntity } from './access-token.entity';

/**
 * 用户模型
 *
 * @export
 * @class UserEntity
 */
@Entity('users')
@AddRelations(() => config('user.relations'))
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Column({ comment: '密码', length: 500, select: false })
    password!: string;

    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Column({ comment: '用户状态,是否激活', default: true })
    actived?: boolean;

    @CreateDateColumn({
        comment: '用户创建时间',
        transformer: {
            from: (date) => time({ date }).format('YYYY-MM-DD HH:mm:ss'),
            to: (date) => date,
        },
    })
    createdAt!: Date;

    /**
     * 用户的登录令牌
     *
     * @type {AccessTokenEntity[]}
     * @memberof UserEntity
     */
    @OneToMany(() => AccessTokenEntity, (accessToken) => accessToken.user, {
        cascade: true,
    })
    accessTokens!: AccessTokenEntity[];
}

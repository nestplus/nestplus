import { DtoValidation, IsMatchPhone, IsUnique, IsUniqueExist } from '@/core';
import { Injectable } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, Length } from 'class-validator';
import { UserEntity } from '../entities';

/**
 * 创建用户数据验证
 *
 * @export
 * @class CreateUserDto
 */
@Injectable()
@DtoValidation({ groups: ['create'] })
export class CreateUserDto {
    @ApiProperty({
        description: '用户名',
    })
    @IsUnique(
        { entity: UserEntity },
        {
            groups: ['create'],
            message: '该用户名已被注册',
        },
    )
    @IsUniqueExist(
        { entity: UserEntity, ignore: 'id' },
        { groups: ['update'], message: '该用户名已被注册' },
    )
    @Length(8, 50, { always: true })
    username!: string;

    @ApiProperty({
        description: '用户密码',
    })
    @Length(8, 50, {
        always: true,
        message: '密码长度不得少于$constraint1',
    })
    password!: string;

    @ApiPropertyOptional({
        description: '用户昵称',
    })
    @Length(3, 20, {
        always: true,
        message: '昵称必须为$constraint1到$constraint2',
    })
    @IsOptional({ always: true })
    nickname?: string;

    @ApiPropertyOptional({
        description: '用户手机号码,形式: {国家代码}.{手机号}',
    })
    @IsUnique(
        { entity: UserEntity },
        {
            groups: ['create'],
            message: '该手机号码已被注册',
        },
    )
    @IsUniqueExist(
        { entity: UserEntity, ignore: 'id' },
        { groups: ['update'], message: '该手机号码已被注册' },
    )
    @IsMatchPhone(
        undefined,
        { strictMode: true },
        {
            message: '手机格式错误,示例: 15005255555或+86.15005255555',
            always: true,
        },
    )
    @IsOptional({ always: true })
    phone?: string;

    @ApiPropertyOptional({ description: '邮箱地址' })
    @IsUnique(
        { entity: UserEntity },
        {
            groups: ['create'],
            message: '邮箱已被占用',
        },
    )
    @IsUniqueExist(
        { entity: UserEntity, ignore: 'id' },
        { groups: ['update'], message: '邮箱已被占用' },
    )
    @IsEmail(undefined, { always: true, message: '邮箱格式错误' })
    @IsOptional({ always: true })
    email?: string;

    @ApiPropertyOptional({ description: '是否激活', default: true })
    @IsBoolean({ always: true, message: 'actived必须为布尔值' })
    @IsOptional({ always: true })
    actived?: boolean;
}

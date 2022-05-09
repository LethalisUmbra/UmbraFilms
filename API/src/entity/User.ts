import { Entity, PrimaryGeneratedColumn, Column, Unique, UpdateDateColumn, CreateDateColumn, OneToMany } from 'typeorm'
import { MinLength, IsNotEmpty, IsEmail } from 'class-validator'
import * as bcrypt from 'bcryptjs'
import { FilmRating } from './FilmRating'

@Entity()
@Unique(['username'])
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @MinLength(6)
    @IsNotEmpty()
    username: string

    @Column()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @Column()
    @MinLength(6)
    @IsNotEmpty()
    password: string

    @Column()
    @IsNotEmpty()
    role: string

    // Rating Film - Many to Many
    @OneToMany(() => FilmRating, (filmRating) => filmRating.user)
    filmsRating: FilmRating[];

    @Column()
    @CreateDateColumn()
    createdAt: Date

    @Column()
    @UpdateDateColumn()
    updatedAt: Date

    hashPassword() {
        const salt = bcrypt.genSaltSync()
        this.password = bcrypt.hashSync(this.password, salt)
    }

    checkPassword(password: string): Boolean {
        return bcrypt.compareSync(password, this.password)
    }

}

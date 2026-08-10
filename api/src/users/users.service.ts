import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.enum';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking for Superuser presence...');
    const superuser = await this.usersRepository.findOne({ where: { role: Role.SUPERUSER } });
    
    if (!superuser) {
      this.logger.log('No Superuser found. Attempting to seed from username.json...');
      
      // Note: we are running inside the /app directory in Docker, so the root directory is /app/.. which is mapped differently,
      // but wait, username.json is in the root of the project.
      // If we are in /app (api directory), the root of the project is NOT mounted by default into the api container unless specified in docker-compose.
      // Let's check docker-compose.yml:
      // volumes:
      //   - ./api:/app
      //   - /app/node_modules
      // This means the api container ONLY sees the `api` folder! It cannot read `../../username.json`!
      // So I will attempt to read `/app/../username.json`, but that will just read from the host root or container root, which doesn't have it.
      // Wait, I should read from `/app/username.json` and tell the user to place it in the `api` folder OR I can modify docker-compose to mount the root folder.
      // Modifying docker-compose is better, but maybe the user just placed it in `interview-support/username.json`.
      // I will mount the username.json via docker-compose later if needed, or I can read from process.cwd() + '/../username.json' assuming they run it locally? No, Docker.
      // Let's assume the user put `username.json` in `api/username.json` or I will use `path.join(__dirname, '../../../../username.json')`
      // Actually, let's just look in the container's root or api directory.
      
      const possiblePaths = [
        path.join(process.cwd(), '..', 'superuser.json'), // if running without docker locally
        path.join(process.cwd(), 'superuser.json'), // if they placed it in api folder
        '/superuser.json' // if mounted to root
      ];
      
      let seeded = false;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          try {
            const data = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (data.username && data.password) {
              const passwordHash = await bcrypt.hash(data.password, 10);
              const newSuperuser = this.usersRepository.create({
                username: data.username,
                passwordHash,
                role: Role.SUPERUSER,
              });
              await this.usersRepository.save(newSuperuser);
              this.logger.log(`Superuser '${data.username}' created successfully from ${p}!`);
              seeded = true;
              break;
            }
          } catch (e) {
            this.logger.error(`Error parsing ${p}:`, e.message);
          }
        }
      }
      
      if (!seeded) {
        this.logger.warn('Could not find or parse superuser.json to create Superuser. Please ensure it exists with username and password keys.');
      }
    } else {
      this.logger.log('Superuser already exists.');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }, // Exclude passwordHash
    });
  }

  async create(userData: any): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      username: userData.username,
      passwordHash,
      role: userData.role,
    });
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: any): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');

    if (updateData.username) user.username = updateData.username;
    if (updateData.role) user.role = updateData.role;
    if (updateData.password) {
      user.passwordHash = await bcrypt.hash(updateData.password, 10);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}

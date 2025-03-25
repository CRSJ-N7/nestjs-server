import { DataSource } from 'typeorm';
import { User } from 'src/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'password',
  database: 'my-app',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

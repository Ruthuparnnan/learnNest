import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './modules/todo/todo.module';

@Module({
  imports: [
    // ✅ MongoDB Connection
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/learndb',
      {
        retryAttempts: 3,
        retryDelay: 1000,
      },
    ),

    // ✅ Enable Scheduling
    ScheduleModule.forRoot(),

    // ✅ GraphQL Setup (FIXED)
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),

    // ✅ Feature Modules
    TodoModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

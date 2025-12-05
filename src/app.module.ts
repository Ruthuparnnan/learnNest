import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { GraphQLError } from 'graphql'; // ✅ ADD THIS

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './modules/todo/todo.module';
import { UserModule } from './user/user.module';

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

    // ✅ GraphQL Setup (SAFE & TYPED)
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,

      formatError: (error: GraphQLError) => {
        // ✅ FIXED TYPE
        const extensions = error.extensions as
          | {
              code?: string;
              originalError?: { statusCode?: number };
            }
          | undefined;

        const originalError = extensions?.originalError;

        return {
          message: String(error.message || 'An error occurred'),
          code: String(extensions?.code || 'INTERNAL_SERVER_ERROR'),
          statusCode: originalError?.statusCode ?? 500,
        };
      },
    }),

    // ✅ Feature Modules
    TodoModule,

    UserModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

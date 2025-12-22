import { HttpException, Module } from '@nestjs/common';
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
import { AuthModule } from './auth/auth.module';
import { JwtGlobalModule } from './auth/jwt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ⭐ makes ConfigService available everywhere
    }),
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

      context: ({ req, res }) => ({ req, res }),

      formatError: (error: GraphQLError) => {
        const originalError = error.originalError;

        // Default values
        let message = error.message;
        let statusCode = 500;
        let code = 'INTERNAL_SERVER_ERROR';

        if (originalError instanceof HttpException) {
          const response = originalError.getResponse();

          statusCode = originalError.getStatus();

          if (typeof response === 'string') {
            message = response;
          } else if (typeof response === 'object') {
            message = (response as any).message || message;
            code = (response as any).error || code;
          }
        }

        return {
          message,
          statusCode,
          code,
        };
      },
    }),

    // ✅ Feature Modules
    TodoModule,

    UserModule,

    AuthModule,

    JwtGlobalModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

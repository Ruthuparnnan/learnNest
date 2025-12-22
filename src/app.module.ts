import {
  MiddlewareConsumer,
  HttpException,
  Module,
  NestModule,
} from '@nestjs/common';
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
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

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
        return {
          message: error.message,
          code: error.extensions?.code,
          statusCode: error.extensions?.statusCode ?? 500,
          correlationId: error.extensions?.correlationId,
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*'); // 👈 apply to all requests
  }
}

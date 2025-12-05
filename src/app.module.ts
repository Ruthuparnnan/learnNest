import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodoModule } from './modules/todo/todo.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/learndb',
      {
        retryAttempts: 3,
        retryDelay: 1000,
      },
    ),
    ScheduleModule.forRoot(), // ✅ Enable scheduling
    TodoModule, // ✅ MongoDB connection with fallback and retry options
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: 'ABSOLUTE_TEST_SECRET',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  exports: [JwtModule],
})
export class JwtGlobalModule {}

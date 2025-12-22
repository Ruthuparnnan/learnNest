import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext().req;
    const correlationId = req?.correlationId;

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          console.log(
            `[${correlationId}] Request completed in ${Date.now() - start}ms`,
          );
        },
        error: (err) => {
          console.error(
            `[${correlationId}] Error after ${Date.now() - start}ms`,
            err,
          );
        },
      }),
    );
  }
}

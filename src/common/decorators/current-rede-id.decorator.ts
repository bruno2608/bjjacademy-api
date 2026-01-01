import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para extrair o rede_id do request.
 * Só funciona após o RedeAdminGuard ter sido executado.
 */
export const CurrentRedeId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.redeId;
  },
);

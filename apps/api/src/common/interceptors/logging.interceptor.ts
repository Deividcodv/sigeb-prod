import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable, tap } from 'rxjs';

/**
 * Registro estructurado de peticiones.
 *
 * Cada petición deja una linea con identificador, método, ruta, estado y
 * duracion. Con el identificador se puede seguir una peticion concreta en
 * los logs (por ejemplo, la carga de un documento o una transicion de
 * solicitud) sin tener que buscarla por hora.
 *
 * El identificador se devuelve en la cabecera `X-Request-Id` para que quien
 * reporte un problema pueda darlo.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /** Rutas cuyo cuerpo o detalle no debe quedar en los logs. */
  private static readonly RUTAS_SENSIBLES = [
    '/auth/login',
    '/auth/registro',
    '/auth/refresh',
    '/auth/eliminar-cuenta',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const inicio = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const requestId = (request.headers['x-request-id'] as string) || randomUUID();
    request.requestId = requestId;
    response.setHeader?.('X-Request-Id', requestId);

    const metodo = request.method;
    // `originalUrl` es la ruta real que se pidio (con el prefijo global
    // incluido). `baseUrl` + `route.path` no la compone de forma fiable.
    const ruta = (request.originalUrl ?? request.url ?? '').split('?')[0];
    const sensible = LoggingInterceptor.RUTAS_SENSIBLES.some((r) =>
      ruta.includes(r),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          console.log(
            JSON.stringify({
              tipo: 'peticion',
              requestId,
              metodo,
              ruta,
              estado: response.statusCode,
              duracionMs: Date.now() - inicio,
              usuarioId: request.user?.id ?? null,
              rol: request.user?.rol?.nombre ?? null,
              ...(sensible ? { cuerpoOmitido: true } : {}),
            }),
          );
        },
        error: (error) => {
          console.error(
            JSON.stringify({
              tipo: 'peticion',
              resultado: 'error',
              requestId,
              metodo,
              ruta,
              estado: response.statusCode ?? 500,
              duracionMs: Date.now() - inicio,
              usuarioId: request.user?.id ?? null,
              error: error?.message ?? String(error),
            }),
          );
        },
      }),
    );
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FallbackProveedor } from './providers/fallback.provider';
import { ProveedorIA, RespuestaIA, ContextoIA } from './asistente.types';

/**
 * Enruta la pregunta al proveedor disponible. Por defecto (y sin
 * credenciales en repo/CI) usa el fallback por reglas/KB. En M4 se agrega
 * el proveedor LLM opcional vía AI_API_KEY/AI_BASE_URL.
 */
@Injectable()
export class AsistenteIAProxy {
  constructor(
    private readonly configService: ConfigService,
    private readonly fallback: FallbackProveedor,
  ) {}

  async responder(pregunta: string, contexto: ContextoIA): Promise<RespuestaIA> {
    const nombre = this.obtenerProveedor();
    return this.resolver(nombre).responder(pregunta, contexto);
  }

  private resolver(nombre: string): ProveedorIA {
    switch (nombre) {
      case 'openai':
        return this.fallback; // reemplazado por OpenAIProveedor en M4
      default:
        return this.fallback;
    }
  }

  private obtenerProveedor(): string {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    return apiKey ? 'openai' : 'fallback-kb';
  }
}
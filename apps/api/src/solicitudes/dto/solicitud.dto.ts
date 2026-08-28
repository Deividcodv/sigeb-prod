import { IsString, IsOptional, IsUUID, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SolicitudTransicion } from '../solicitud-state-machine';

const TRANSICIONES: SolicitudTransicion[] = [
  'enviar',
  'iniciar_revision',
  'solicitar_correccion',
  'corregir',
  'evaluar',
  'aprobar',
  'rechazar',
];

export class CreateSolicitudDto {
  @ApiProperty({ description: 'ID de la convocatoria a la que se postula' })
  @IsUUID()
  convocatoriaId!: string;
}

export class TransicionSolicitudDto {
  @ApiProperty({ enum: TRANSICIONES })
  @IsIn(TRANSICIONES)
  accion!: SolicitudTransicion;

  @ApiPropertyOptional({ description: 'Comentario registrado en el historial' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
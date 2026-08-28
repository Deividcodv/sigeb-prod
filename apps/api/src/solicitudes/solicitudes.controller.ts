import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto, TransicionSolicitudDto } from './dto';
import { Permisos } from '../common/decorators/permisos.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@ApiTags('Solicitudes')
@Controller('solicitudes')
@ApiBearerAuth()
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Post()
  @Permisos('solicitud:crear')
  @ApiOperation({ summary: 'Crear solicitud para una convocatoria abierta' })
  @ApiResponse({ status: 201, description: 'Solicitud creada en BORRADOR' })
  @ApiResponse({ status: 400, description: 'Convocatoria no abierta o solicitud duplicada' })
  create(
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() dto: CreateSolicitudDto,
  ) {
    return this.solicitudesService.create(usuario.id, dto);
  }

  @Get()
  @Permisos('solicitud:ver')
  @ApiOperation({ summary: 'Listar mis solicitudes (admin: todas)' })
  findAll(@CurrentUser() usuario: AuthenticatedUser) {
    return this.solicitudesService.findAll(usuario);
  }

  @Get(':id')
  @Permisos('solicitud:ver')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.solicitudesService.findById(id, usuario);
  }

  @Post(':id/transicion')
  @Permisos('solicitud:editar')
  @ApiOperation({ summary: 'Aplicar transición de estado (máquina de estados)' })
  @ApiResponse({ status: 400, description: 'Transición inválida' })
  transicion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransicionSolicitudDto,
    @CurrentUser() usuario: AuthenticatedUser,
  ) {
    return this.solicitudesService.transicion(id, dto, usuario);
  }
}
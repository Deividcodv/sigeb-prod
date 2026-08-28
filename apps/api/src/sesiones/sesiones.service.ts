import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearSesionDto, RegistrarVotoDto } from './sesiones.dto';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crearSesion(dto: CrearSesionDto) {
    const comite = await this.prisma.comite.findUnique({
      where: { id: dto.comiteId },
    });
    if (!comite) {
      throw new NotFoundException(`Comité con id ${dto.comiteId} no encontrado`);
    }

    const solicitudes = await this.prisma.solicitud.findMany({
      where: { id: { in: dto.solicitudesIds } },
      select: { id: true, estado: true, convocatoriaId: true },
    });

    const encontradas = new Set(solicitudes.map((s) => s.id));
    const faltantes = dto.solicitudesIds.filter((id) => !encontradas.has(id));
    if (faltantes.length > 0) {
      throw new NotFoundException(
        `Solicitudes no encontradas: ${faltantes.join(', ')}`,
      );
    }

    const noEvaluadas = solicitudes.filter((s) => s.estado !== 'EVALUADA');
    if (noEvaluadas.length > 0) {
      throw new BadRequestException(
        `La agenda solo admite solicitudes EVALUADA: ${noEvaluadas
          .map((s) => s.id)
          .join(', ')}`,
      );
    }

    const convocatorias = new Set(solicitudes.map((s) => s.convocatoriaId));
    if (convocatorias.size > 1) {
      throw new BadRequestException(
        'Todas las solicitudes de la agenda deben pertenecer a la misma convocatoria',
      );
    }

    return this.prisma.sesion.create({
      data: {
        comiteId: dto.comiteId,
        fecha: new Date(dto.fecha),
        lugar: dto.lugar,
        quorumMinimo: dto.quorumMinimo,
        agenda: {
          create: dto.solicitudesIds.map((solicitudId) => ({ solicitudId })),
        },
      },
      include: {
        comite: { select: { id: true, nombre: true } },
        agenda: { select: { solicitudId: true } },
      },
    });
  }

  async listarSesiones() {
    return this.prisma.sesion.findMany({
      include: {
        comite: { select: { id: true, nombre: true } },
        _count: { select: { agenda: true, votos: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerSesion(id: string) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
      include: {
        comite: { select: { id: true, nombre: true } },
        agenda: {
          include: {
            solicitud: {
              select: {
                id: true,
                estado: true,
                usuario: { select: { nombres: true, cui: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        votos: {
          include: {
            usuario: { select: { id: true, nombres: true } },
            solicitud: { select: { id: true } },
          },
        },
        decisiones: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con id ${id} no encontrada`);
    }

    return sesion;
  }

  async registrarVoto(
    sesionId: string,
    dto: RegistrarVotoDto,
    usuario: AuthenticatedUser,
  ) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id: sesionId },
      include: {
        comite: true,
        agenda: { select: { solicitudId: true } },
      },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con id ${sesionId} no encontrada`);
    }

    if (sesion.estado === 'FINALIZADA') {
      throw new BadRequestException('La sesión ya fue finalizada');
    }

    const miembro = await this.prisma.comiteMiembro.findFirst({
      where: { comiteId: sesion.comiteId, usuarioId: usuario.id, activo: true },
    });
    if (!miembro) {
      throw new ForbiddenException(
        'Solo los miembros activos del comité pueden votar',
      );
    }

    const enAgenda = sesion.agenda.some((a) => a.solicitudId === dto.solicitudId);
    if (!enAgenda) {
      throw new BadRequestException(
        'La solicitud no está en la agenda de la sesión',
      );
    }

    const yaVotado = await this.prisma.voto.findFirst({
      where: {
        sesionId,
        solicitudId: dto.solicitudId,
        usuarioId: usuario.id,
      },
    });
    if (yaVotado) {
      throw new BadRequestException(
        'Ya registraste tu voto para esta solicitud en la sesión',
      );
    }

    return this.prisma.voto.create({
      data: {
        sesionId,
        solicitudId: dto.solicitudId,
        usuarioId: usuario.id,
        voto: dto.voto,
        observaciones: dto.observaciones,
      },
    });
  }
}
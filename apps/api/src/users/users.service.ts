import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AssignPermisoDto } from './dto/assign-permiso.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AssignUsuarioPermisosDto } from './dto/assign-usuario-permisos.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAllRoles() {
    return this.prisma.rol.findMany({
      include: {
        rolPermisos: {
          include: { permiso: true },
        },
      },
    });
  }

  async findRolById(id: string) {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: {
        rolPermisos: {
          include: { permiso: true },
        },
      },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }

    return rol;
  }

  async createRol(dto: CreateRolDto, usuario: AuthenticatedUser) {
    const existing = await this.prisma.rol.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existing) {
      throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
    }

    const rol = await this.prisma.rol.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
      },
    });

    await this.audit.log({
      usuarioId: usuario.id,
      accion: 'crear',
      entidad: 'rol',
      entidadId: rol.id,
      detalle: { nombre: dto.nombre },
    });

    return rol;
  }

  async updateRol(id: string, dto: UpdateRolDto, usuario: AuthenticatedUser) {
    await this.findRolById(id);

    if (dto.nombre) {
      const existing = await this.prisma.rol.findFirst({
        where: { nombre: dto.nombre, id: { not: id } },
      });

      if (existing) {
        throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
      }
    }

    const rol = await this.prisma.rol.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      usuarioId: usuario.id,
      accion: 'editar',
      entidad: 'rol',
      entidadId: id,
      detalle: { ...dto },
    });

    return rol;
  }

  async deleteRol(id: string, usuario: AuthenticatedUser) {
    await this.findRolById(id);

    const usersWithRole = await this.prisma.usuario.count({
      where: { rolId: id },
    });

    if (usersWithRole > 0) {
      throw new ConflictException(
        `No se puede eliminar el rol: ${usersWithRole} usuario(s) lo tienen asignado`,
      );
    }

    const rol = await this.prisma.rol.delete({ where: { id } });

    await this.audit.log({
      usuarioId: usuario.id,
      accion: 'eliminar',
      entidad: 'rol',
      entidadId: id,
    });

    return rol;
  }

  async assignPermisoToRol(
    rolId: string,
    dto: AssignPermisoDto,
    usuario: AuthenticatedUser,
  ) {
    await this.findRolById(rolId);

    await this.prisma.rolPermiso.deleteMany({
      where: { rolId },
    });

    const rolPermisos = dto.permisoIds.map((permisoId) => ({
      rolId,
      permisoId,
    }));

    await this.prisma.rolPermiso.createMany({
      data: rolPermisos,
    });

    await this.audit.log({
      usuarioId: usuario.id,
      accion: 'asignar-permisos',
      entidad: 'rol',
      entidadId: rolId,
      detalle: { permisoIds: dto.permisoIds },
    });

    return this.findRolById(rolId);
  }

  async findAllPermisos() {
    return this.prisma.permiso.findMany();
  }

  async findAllUsuarios(rol?: string) {
    return this.prisma.usuario.findMany({
      where: rol ? { rol: { nombre: rol } } : undefined,
      select: {
        id: true,
        cui: true,
        nombres: true,
        email: true,
        estado: true,
        rol: { select: { nombre: true } },
      },
      orderBy: { nombres: 'asc' },
    });
  }

  async findUsuarioById(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: { select: { id: true, nombre: true } },
        usuarioPermisos: {
          include: { permiso: { select: { id: true, modulo: true, accion: true } } },
        },
      },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const { passwordHash: _, ...sinPassword } = usuario;
    return sinPassword;
  }

  async createUsuario(dto: CreateUsuarioDto, actor: AuthenticatedUser) {
    const existingCui = await this.prisma.usuario.findUnique({
      where: { cui: dto.cui },
    });

    if (existingCui) {
      throw new ConflictException('El CUI ya está registrado');
    }

    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const rol = await this.prisma.rol.findUnique({ where: { id: dto.rolId } });

    if (!rol) {
      throw new NotFoundException(`Rol con id ${dto.rolId} no encontrado`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const usuario = await this.prisma.usuario.create({
      data: {
        cui: dto.cui,
        nombres: dto.nombres,
        email: dto.email,
        passwordHash,
        rolId: rol.id,
      },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    await this.audit.log({
      usuarioId: actor.id,
      accion: 'crear',
      entidad: 'usuario',
      entidadId: usuario.id,
      detalle: { cui: dto.cui, email: dto.email, rolId: rol.id },
    });

    const { passwordHash: _, ...sinPassword } = usuario;
    return sinPassword;
  }

  async updateUsuario(id: string, dto: UpdateUsuarioDto, actor: AuthenticatedUser) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    if (id === actor.id && dto.estado === 'INACTIVO') {
      throw new BadRequestException(
        'No puedes inactivar tu propio usuario; perderías el acceso',
      );
    }

    if (dto.rolId) {
      const rol = await this.prisma.rol.findUnique({ where: { id: dto.rolId } });

      if (!rol) {
        throw new NotFoundException(`Rol con id ${dto.rolId} no encontrado`);
      }
    }

    const { rolId, estado } = dto;

    if (rolId === undefined && estado === undefined) {
      return this.findUsuarioById(id);
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...(rolId !== undefined ? { rolId } : {}),
        ...(estado !== undefined ? { estado } : {}),
      },
      include: { rol: { select: { id: true, nombre: true } } },
    });

    await this.audit.log({
      usuarioId: actor.id,
      accion: 'editar',
      entidad: 'usuario',
      entidadId: id,
      detalle: { ...dto },
    });

    const { passwordHash: _, ...sinPassword } = actualizado;
    return sinPassword;
  }

  async assignUsuarioPermisos(
    id: string,
    dto: AssignUsuarioPermisosDto,
    actor: AuthenticatedUser,
  ) {
    await this.findUsuarioById(id);

    await this.prisma.usuarioPermiso.deleteMany({
      where: { usuarioId: id },
    });

    if (dto.permisos.length > 0) {
      await this.prisma.usuarioPermiso.createMany({
        data: dto.permisos.map((p) => ({
          usuarioId: id,
          permisoId: p.permisoId,
          efecto: p.efecto,
        })),
      });
    }

    await this.audit.log({
      usuarioId: actor.id,
      accion: 'asignar-permisos',
      entidad: 'usuario',
      entidadId: id,
      detalle: { permisos: dto.permisos },
    });

    return this.findUsuarioById(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthzService } from '../common/services/authz.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { DOCUMENTO_ESTADO } from '../common/constants/estados';

@Injectable()
export class SolicitudChecklistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthzService,
  ) {}

  async obtener(id: string, usuario: AuthenticatedUser) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        convocatoria: {
          include: {
            documentosRequeridos: { include: { documentoTipo: true } },
          },
        },
        perfilAcademico: true,
        perfilFinanciero: true,
        documentos: { include: { documentoTipo: true } },
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }

    this.authz.assertAcceso(solicitud, usuario);

    const perfilAcademicoOk =
      Boolean(
        solicitud.perfilAcademico?.generoId ||
          solicitud.perfilAcademico?.generoOtro,
      ) &&
      Boolean(
        solicitud.perfilAcademico?.nivelAcademicoId ||
          solicitud.perfilAcademico?.nivelAcademicoOtro,
      );
    const perfilFinancieroOk = Boolean(
      solicitud.perfilFinanciero?.ingresoFamiliar != null,
    );

    const ultimosPorTipo = new Map<
      string,
      (typeof solicitud.documentos)[number]
    >();
    for (const doc of solicitud.documentos) {
      const actual = ultimosPorTipo.get(doc.documentoTipoId);
      if (!actual || doc.version > actual.version) {
        ultimosPorTipo.set(doc.documentoTipoId, doc);
      }
    }

    const documentos = solicitud.convocatoria.documentosRequeridos.map(
      (dr) => {
        const ultimo = ultimosPorTipo.get(dr.documentoTipoId);
        const cargado = Boolean(ultimo && ultimo.estado === DOCUMENTO_ESTADO.CARGADO);
        return {
          documentoTipoId: dr.documentoTipoId,
          nombre: dr.documentoTipo.nombre,
          obligatorio: dr.obligatorio,
          cargado,
          archivoUrl: cargado ? ultimo!.archivoUrl : null,
        };
      },
    );

    const pendientes: string[] = [];
    if (!perfilAcademicoOk) {
      pendientes.push('Perfil académico incompleto (género y nivel académico)');
    }
    if (!perfilFinancieroOk) {
      pendientes.push('Perfil financiero incompleto (ingreso familiar requerido)');
    }
    for (const documento of documentos) {
      if (documento.obligatorio && !documento.cargado) {
        pendientes.push(`Documento "${documento.nombre}" pendiente`);
      }
    }

    return {
      solicitudId: id,
      estado: solicitud.estado,
      perfilAcademico: perfilAcademicoOk,
      perfilFinanciero: perfilFinancieroOk,
      documentos,
      pendientes,
      completo: pendientes.length === 0,
    };
  }
}

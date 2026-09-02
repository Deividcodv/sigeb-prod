import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { ConstanciasService } from './constancias.service';
import { PDF_RENDERER } from './pdf/pdf-renderer.interface';
import { PuppeteerPdfRenderer } from './pdf/puppeteer-pdf-renderer';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolicitudesController],
  providers: [
    SolicitudesService,
    ConstanciasService,
    { provide: PDF_RENDERER, useClass: PuppeteerPdfRenderer },
  ],
  exports: [SolicitudesService, ConstanciasService],
})
export class SolicitudesModule {}
import { Module } from '@nestjs/common';
import { AsistenteService } from './asistente.service';
import { AsistenteController } from './asistente.controller';
import { AsistenteIAProxy } from './asistente.proxy';
import { FallbackProveedor } from './providers/fallback.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AsistenteController],
  providers: [AsistenteService, AsistenteIAProxy, FallbackProveedor],
  exports: [AsistenteService],
})
export class AsistenteModule {}
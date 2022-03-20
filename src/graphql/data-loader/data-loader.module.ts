import { DataloaderService } from './data-loader.service'
import { Module } from '@nestjs/common'

@Module({
  providers: [DataloaderService],
  exports: [DataloaderService]
})
export class DataloaderModule {}

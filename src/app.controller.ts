import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello()
  }
}

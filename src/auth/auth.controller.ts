import { Body, Controller, Post } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private AuthService: AuthService) {}
  @Post('/signup')
  signup(@Body() authCredentialsDto: AuthCredentialsDto): Promise<any> {
    return this.AuthService.createUser(authCredentialsDto);
  }
  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.AuthService.signIn(authCredentialsDto);
  }
}

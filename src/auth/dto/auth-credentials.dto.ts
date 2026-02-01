import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).+)/, {
    message:
      'password too weak. it must contain at least one upper case letter, one lower case letter, one number and one special character',
  })
  password: string;
}

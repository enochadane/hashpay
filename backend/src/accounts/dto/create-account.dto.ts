import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAccountDto {
    @IsUUID()
    @IsNotEmpty()
    currencyId: string;

    @IsString()
    @IsNotEmpty()
    providerDetails: string;
}

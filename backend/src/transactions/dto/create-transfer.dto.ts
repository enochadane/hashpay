import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateTransferDto {
    @IsUUID()
    @IsNotEmpty()
    fromAccountId: string;

    @IsUUID()
    @IsNotEmpty()
    toAccountId: string;

    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    @Min(0.01)
    amount: number;

    @IsUUID()
    @IsNotEmpty()
    currencyId: string;

    @IsString()
    @IsNotEmpty()
    idempotencyKey: string;
}

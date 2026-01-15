import { IsString, IsOptional, IsNotEmpty, IsNumber, IsPhoneNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCustomerDto {
    @ApiProperty({ example: 'Nguyễn Văn A' })
    @IsNotEmpty()
    @IsString()
    customer_name: string;

    @ApiProperty({ example: '0987654321' })
    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    img_customer?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    date_of_birth?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cccd?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    permanent_address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    living_area?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    the_product_type?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    marital_status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    interest?: string;

    @ApiPropertyOptional({ example: 1000000000 })
    @IsOptional()
    @IsNumber()
    total_assets?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    business_field?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    zalo_status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facebook?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) { }

class RelativeDto {
    @ApiProperty({ example: 'Cha' })
    relative_name: string;

    @ApiProperty({ example: '0909123456', nullable: true })
    phone_number: string | null;
}

class ProjectDto {
    @ApiProperty({ example: 'Dự án Bình Dương' })
    project_name: string;
}

class ContractDto {
    @ApiProperty({ example: 'Hợp đồng mua bán' })
    name: string;
}

class NoteDto {
    @ApiProperty({ example: 'Khách hàng tiềm năng' })
    content: string;
}

export class CustomerDetailResponse {
    @ApiProperty({ example: 'c5db02b1-d233-4158-bfc0-531a96832c3c' })
    id: string;

    @ApiProperty({ example: 'Nguyễn Văn A', nullable: true })
    customer_name: string | null;

    @ApiProperty({ example: '0909123456', nullable: true })
    phone_number: string | null;

    @ApiProperty({ example: 'test@gmail.com', nullable: true })
    email: string | null;

    @ApiProperty({ example: 'Bình Dương', nullable: true })
    address: string | null;

    @ApiProperty({ type: [RelativeDto] })
    relatives: RelativeDto[];

    @ApiProperty({ type: [ProjectDto] })
    projects: ProjectDto[];

    @ApiProperty({ type: [ContractDto] })
    contracts: ContractDto[];

    @ApiProperty({ type: [NoteDto] })
    notes: NoteDto[];
}
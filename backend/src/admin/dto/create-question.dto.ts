import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsOptional()
  @IsString()
  questionCode?: string;

  @IsOptional()
  @IsString()
  questionType?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsString()
  text: string;

  /**
   * JSON-stringified array of exactly 4 answer option strings.
   * Example: '["Option A","Option B","Option C","Option D"]'
   */
  @IsString()
  options: string;

  @IsInt()
  @Min(0)
  @Max(3)
  @Type(() => Number)
  correctIndex: number;

  @IsOptional()
  @IsString()
  signCode?: string;

  @IsOptional()
  @IsString()
  signId?: string;

  @IsOptional()
  @IsString()
  signVariantId?: string;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsString()
  jurisdictionId?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

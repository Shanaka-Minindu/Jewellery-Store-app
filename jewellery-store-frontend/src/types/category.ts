export type Gender = 'MALE' | 'FEMALE' | 'UNISEX';

export interface CategoryReqDto {
  title: string;
  gender: Gender;
}

export interface CategoryResDto {
  id: number;
  title: string;
  gender: Gender;
  productCount: number;
}

export interface BasicRes{
    id:number,
    message:string
}


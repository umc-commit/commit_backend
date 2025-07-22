// 신청함 목록 조회 DTO
export class GetRequestListDto {
  constructor({ filter = 'all', page = 1, limit = 10 }) {
    this.filter = filter; // 'all' | 'ongoing' | 'completed'
    this.page = parseInt(page);
    this.limit = parseInt(limit);
    this.offset = (this.page - 1) * this.limit;
  }
}
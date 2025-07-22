// 신청함 목록 조회 DTO
export class GetRequestListDto {
  constructor({ filter = 'all', page = 1, limit = 10 }) {
    this.filter = filter; // 'all' | 'ongoing' | 'completed'
    this.page = parseInt(page);
    this.limit = parseInt(limit);
    this.offset = (this.page - 1) * this.limit;
  }
}

// 리퀘스트 상태 변경 DTO
export class UpdateRequestStatusDto {
  constructor({ requestId, status }) {
    this.requestId = requestId;
    this.status = status;
  }
}
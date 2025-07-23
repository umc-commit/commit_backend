// 팔로잉 작가 커미션 조회 DTO
export class GetFollowingCommissionsDto {
  constructor({ page = 1, limit = 10 }) {
    this.page = parseInt(page);
    this.limit = parseInt(limit);
    this.offset = (this.page - 1) * this.limit;
  }
}
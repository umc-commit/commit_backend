// 커미션 게시글 상세글 조회 dto
export class GetCommissionDetailDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}
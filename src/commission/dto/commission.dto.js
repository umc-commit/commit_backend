// 커미션 게시글 상세글 조회 dto
export class GetCommissionDetailDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}

// 커미션 신청폼 조회 dto
export class GetCommissionFormDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}
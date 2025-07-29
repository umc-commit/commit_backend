// 커미션 게시글 상세글 조회 dto
export class GetCommissionDetailDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}

// 커미션 게시글 작가 정보 조회 dto
export class GetCommissionArtistInfoDto {
  constructor({ commissionId, page = 1, limit = 10 }) {
    this.commissionId = commissionId;
    this.page = parseInt(page);
    this.limit = parseInt(limit);
  }
}

// 커미션 신청폼 조회 dto
export class GetCommissionFormDto {
  constructor({ commissionId }) {
    this.commissionId = commissionId;
  }
}

// 커미션 신청폼 제출 dto
export class SubmitCommissionRequestDto {
  constructor({ commissionId, formAnswer }) {
    this.commissionId = commissionId;
    this.formAnswer = formAnswer;
  }
}
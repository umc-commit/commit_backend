// /src/commission/service/commission.service.js
import { CommissionRepository } from "../repository/commission.repository.js";
import {
 CommissionNotFoundError
} from "../../common/errors/commission.errors.js";

export const CommissionService = {

 /**
  * 커미션 게시글 상세글 조회
  */
 async getCommissionDetail(userId, dto) {
   const { commissionId } = dto;

   // 1. 커미션 존재 여부 확인 및 상세 조회
   const commission = await CommissionRepository.findCommissionWithDetailsById(commissionId, userId);
   if (!commission) {
     throw new CommissionNotFoundError({ commissionId });
   }

   // 2. 이미지 조회
   const images = await CommissionRepository.findImagesByCommissionId(commissionId);

   // 3. 비즈니스 로직 처리
   const thumbnailImageUrl = images.find(img => img.orderIndex === 0)?.imageUrl || null;
   const remainingSlots = commission.artist.slot - commission.requests.length;
   const tags = commission.commissionTags.map(ct => ct.tag.name);

   return {
     id: commission.id,
     title: commission.title,
     summary: commission.summary,
     content: commission.content,
     minPrice: commission.minPrice,
     category: commission.category.name,
     tags,
     images: images.map(img => ({
       id: img.id,
       imageUrl: img.imageUrl,
       orderIndex: img.orderIndex
     })),
     thumbnailImageUrl,
     remainingSlots,
     isBookmarked: commission.bookmarks?.length > 0 || false,
     createdAt: commission.createdAt.toISOString()
   };
 },

   /**
   * 커미션 신청폼 조회
   */
  async getCommissionForm(userId, dto) {
    const { commissionId } = dto;

    // 커미션 존재 여부 확인 및 조회
    const commission = await CommissionRepository.findCommissionFormById(commissionId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId });
    }

    // 썸네일 이미지 조회
    const thumbnailImage = await CommissionRepository.findThumbnailImageByCommissionId(commissionId);

    // formSchema 처리
    const customFields = commission.formSchema?.fields || [];
    
    // 기본 필드들 (항상 마지막에 추가)
    const defaultFields = [
      {
        id: (customFields.length + 1).toString(),
        type: "textarea",
        label: "신청 내용",
        required: false,
        maxLength: 5000
      },
      {
        id: (customFields.length + 2).toString(),
        type: "file",
        label: "참고 이미지",
        required: false,
        maxFiles: 10,
        acceptedTypes: ["image/jpeg", "image/png"]
      }
    ];

    // 4. 응답 데이터 구성
    return {
      commission: {
        id: commission.id,
        title: commission.title,
        thumbnailImageUrl: thumbnailImage?.imageUrl || null,
        artist: {
          id: commission.artist.id,
          nickname: commission.artist.nickname
        }
      },
      formSchema: {
        fields: [...customFields, ...defaultFields]
      }
    };
  },
};
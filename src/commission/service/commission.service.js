import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CommissionRepository } from "../repository/commission.repository.js";
import {
 CommissionNotFoundError,
  FileSizeExceededError,
  UnsupportedImageFormatError,
  ImageUploadFailedError
} from "../../common/errors/commission.errors.js";

export const CommissionService = {
  // 업로드 디렉토리 설정
  uploadDir: path.join(process.cwd(), 'uploads', 'request-images'),

  /**
   * 업로드 디렉토리 생성
   */
  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`업로드 디렉토리 생성: ${this.uploadDir}`);
    }
  },

  /**
   * multer 저장소 설정
   */
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'request-images');
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      // 파일명: request_현재시간_랜덤값.확장자
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `request_${timestamp}_${random}${ext}`);
    }
  }),

  /**
   * 파일 필터 (이미지만 허용)
   */
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new UnsupportedImageFormatError({ 
        fileType: file.mimetype,
        allowedTypes 
      }), false);
    }
  },

  /**
   * multer 인스턴스 생성
   */
  getUploadMiddleware() {
    // 업로드 디렉토리 확인
    this.ensureUploadDir();
    
    return multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
      }
    }).single('image');
  },

  /**
   * 이미지 업로드 처리
   */
  async uploadRequestImage(file) {
    try {
      // 1. 파일 존재 여부 확인
      if (!file) {
        throw new ImageUploadFailedError('파일이 업로드되지 않았습니다');
      }

      // 2. 파일 크기 추가 검증
      if (file.size > 5 * 1024 * 1024) {
        this.deleteFile(file.path);
        throw new FileSizeExceededError({
          maxSize: '5MB',
          receivedSize: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`
        });
      }

      // 3. 파일 URL 생성
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const imageUrl = `${baseUrl}/uploads/request-images/${file.filename}`;

      // 4. 성공 응답 반환
      return {
        image_url: imageUrl,
        file_size: file.size,
        file_type: file.mimetype
      };

    } catch (error) {
      // 오류 발생 시 업로드된 파일 삭제
      if (file && file.path) {
        this.deleteFile(file.path);
      }
      throw error;
    }
  },

  /**
   * 파일 삭제 헬퍼 메서드
   */
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`파일 삭제: ${filePath}`);
      }
    } catch (error) {
      console.error('파일 삭제 실패:', error);
    }
  },


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
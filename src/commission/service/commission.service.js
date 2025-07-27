import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CommissionRepository } from "../repository/commission.repository.js";
import {
 CommissionNotFoundError,
  FileSizeExceededError,
  UnsupportedImageFormatError,
  ImageUploadFailedError,
  RequiredFieldMissingError,
  InvalidOptionValueError,
  FileCountExceededError,
  TextLengthExceededError,
  InvalidFormSchemaError,
  DuplicateRequestError
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

  /**
   * 커미션 신청 제출
   */
  async submitCommissionRequest(userId, dto) {
    const { commissionId, formAnswer } = dto;

    // 커미션 존재 여부 확인
    const commission = await CommissionRepository.findCommissionFormById(commissionId);
    if (!commission) {
      throw new CommissionNotFoundError({ commissionId });
    }

    // 중복 신청 확인
    const existingRequest = await CommissionRepository.findExistingRequest(userId, commissionId);
    if (existingRequest) {
      throw new DuplicateRequestError({ 
        userId, 
        commissionId,
        existingRequestId: existingRequest.id
      });
    }

    // formSchema 가져오기
    const customFields = commission.formSchema?.fields || [];
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
    const allFields = [...customFields, ...defaultFields];

    // formAnswer 검증
    const { additionalPrice, processedFormData } = this.validateFormAnswer(formAnswer, allFields);
    const totalPrice = commission.minPrice + additionalPrice;

    // waitlist 계산
    const totalRequestCount = await CommissionRepository.countAllRequestsByCommissionId(commissionId);
    const waitlist = totalRequestCount + 1;

    // Request 생성
    const newRequest = await CommissionRepository.createRequest({
      userId: BigInt(userId),
      commissionId: BigInt(commissionId),
      formAnswer: formAnswer,
      totalPrice: totalPrice,
      waitlist: waitlist
    });

    // 응답 데이터 구성
    return {
      requestId: newRequest.id,
      userId: userId,
      message: "커미션 신청이 완료되었습니다.",
      submitted: {
        totalPrice: totalPrice,
        formData: processedFormData,
        waitlist: waitlist
      }
    };
  },

  /**
   * formAnswer 검증 및 가격 계산
   */
  validateFormAnswer(formAnswer, fields) {
    let additionalPrice = 0;
    const processedFormData = {};

    // 필수 필드 검증
    const requiredFields = fields.filter(f => f.required);
    const missingFields = [];

    for (const field of requiredFields) {
      if (!formAnswer[field.id] || formAnswer[field.id] === '') {
        missingFields.push(field.id);
      }
    }

    if (missingFields.length > 0) {
      throw new RequiredFieldMissingError({
        missingFields,
        requiredFields: requiredFields.map(f => f.id)
      });
    }

    // 각 필드별 검증
    for (const [fieldId, value] of Object.entries(formAnswer)) {
      const field = fields.find(f => f.id === fieldId);
      
      if (!field) {
        throw new InvalidFormSchemaError({
          invalidField: fieldId,
          reason: "존재하지 않는 필드입니다"
        });
      }

      // 필드 타입별 검증
      switch (field.type) {
        case 'radio':
          this.validateRadioField(field, value, fieldId);
          // 가격 계산
          const selectedOption = field.options.find(opt => opt.value === value);
           additionalPrice += selectedOption.additionalPrice;
          // 형태 변환
          processedFormData[field.label] = selectedOption.label;
          break;

        case 'textarea':
          this.validateTextareaField(field, value, fieldId);
          processedFormData[field.label] = value;
          break;

        case 'file':
          this.validateFileField(field, value, fieldId);
          processedFormData[field.label] = value;
          break;

        default:
          throw new InvalidFormSchemaError({
            fieldId,
            reason: `지원하지 않는 필드 타입: ${field.type}`
          });
      }
    }

    return { additionalPrice, processedFormData };
  },

  /**
   * Radio 필드 검증
   */
  validateRadioField(field, value, fieldId) {
    if (typeof value !== 'string') {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'string',
        receivedType: typeof value
      });
    }

    const validOptions = field.options.map(opt => opt.value);
    if (!validOptions.includes(value)) {
      throw new InvalidOptionValueError({
        fieldId,
        invalidValue: value,
        validOptions
      });
    }
  },

  /**
   * Textarea 필드 검증
   */
  validateTextareaField(field, value, fieldId) {
    if (typeof value !== 'string') {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'string',
        receivedType: typeof value
      });
    }

    if (field.maxLength && value.length > field.maxLength) {
      throw new TextLengthExceededError({
        fieldId,
        maxLength: field.maxLength,
        actualLength: value.length
      });
    }
  },

  /**
   * File 필드 검증
   */
  validateFileField(field, value, fieldId) {
    if (!Array.isArray(value)) {
      throw new InvalidFormSchemaError({
        fieldId,
        expectedType: 'array',
        receivedType: typeof value
      });
    }

    if (field.maxFiles && value.length > field.maxFiles) {
      throw new FileCountExceededError({
        fieldId,
        maxFiles: field.maxFiles,
        actualCount: value.length
      });
    }

    // URL 형식 간단 검증
    for (const url of value) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new InvalidFormSchemaError({
          fieldId,
          reason: "잘못된 이미지 URL 형식",
          invalidUrl: url
        });
      }
    }
  }
};
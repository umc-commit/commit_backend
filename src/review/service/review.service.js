import path from 'path';
import fs from 'fs';
import multer from 'multer';

// 관련 에러 클래스 import
import {
  UnsupportedImageFormatError,
  FileSizeExceededError,
  ImageUploadFailedError
} from '../../common/errors/review.errors.js';

// TODO: 추후 프로젝트 완성 시 AWS S3 연동으로 변경 예정
class ReviewService {

  /**
   * 파일 업로드를 위한 multer 설정
   */
  constructor() {
    // 업로드 디렉토리 설정 (프로젝트 루트/uploads/reviews)
    this.uploadDir = path.join(process.cwd(), 'uploads', 'reviews');
    this.ensureUploadDir();
    
    // multer 저장소 설정
    this.storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // 파일명 생성: review_현재시간_랜덤값.확장자
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `review_${timestamp}_${random}${ext}`);
      }
    });

    // 파일 필터 (이미지만 허용)
    this.fileFilter = (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new UnsupportedImageFormatError(file.mimetype), false);
      }
    };

    // multer 인스턴스 생성
    this.upload = multer({
      storage: this.storage,
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
      }
    });
  }

  /**
   * 업로드 디렉토리가 없으면 생성
   * TODO: S3 연동 시 이 메서드는 불필요하므로 삭제 예정
   */
  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log(`업로드 디렉토리 생성: ${this.uploadDir}`);
    }
  }

  /**
   * 이미지 업로드 처리
   * 
   * @param {Object} file - multer로 업로드된 파일 객체
   * @returns {Object} 업로드 결과 { image_url, file_size, file_type }
   * 
   * @example 
   * const result = await reviewService.uploadImage(req.file);
   * // result: { image_url: "http://localhost:3000/uploads/reviews/review_123_456.jpg", file_size: 1024, file_type: "image/jpeg" }
   */
  async uploadImage(file) {
    try {
      // 1. 파일 존재 여부 확인 (사용자가 파일을 보내지 않았거나, multer에서 처리 실패 시)
      if (!file) {
        throw new ImageUploadFailedError('파일이 업로드되지 않았습니다');
      }

      // 2. 파일 크기 추가 검증
      if (file.size > 5 * 1024 * 1024) {
        // 업로드된 파일 삭제
        this.deleteFile(file.path);
        throw new FileSizeExceededError(file.size);
      }

      // 3. 파일 URL 생성 (현재: 로컬 환경용)
      // TODO: S3 연동 시 S3 URL 생성 로직으로 변경 필요
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const imageUrl = `${baseUrl}/uploads/reviews/${file.filename}`;

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
  }

  /**
   * 파일 삭제 헬퍼 메서드
   * TODO: S3 연동 시 S3 객체 삭제 로직으로 변경 필요
   * @param {string} filePath - 삭제할 파일 경로
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
  }
}

export default new ReviewService();
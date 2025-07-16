import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 파일들을 동적으로 로드하는 함수
function loadSwaggerFiles() {
  const swaggerDir = __dirname;
  const files = fs.readdirSync(swaggerDir);
  const schemas = {};
  
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(swaggerDir, file);
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const moduleName = path.basename(file, '.json');
      schemas[moduleName] = fileContent;
    }
  });
  
  return schemas;
}

// Swagger 기본 설정
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Commit API',
    version: '1.0.0',
    description: 'Commit API 테스트',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
   components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

// 모든 JSON 파일들을 합치는 함수
function combineSwaggerSchemas() {
  const schemas = loadSwaggerFiles();
const combinedSpec = {
  ...swaggerDefinition,
  paths: {},
  components: {
    ...swaggerDefinition.components,
    schemas: {},
  },
};

  // 각 스키마 파일의 내용을 병합
  Object.keys(schemas).forEach(moduleName => {
    const schema = schemas[moduleName];
    
    if (schema.paths) {
      combinedSpec.paths = { ...combinedSpec.paths, ...schema.paths };
    }
    
    if (schema.components && schema.components.schemas) {
      combinedSpec.components.schemas = {
        ...combinedSpec.components.schemas,
        ...schema.components.schemas
      };
    }
  });

  return combinedSpec;
}

// Swagger 미들웨어 설정
export function setupSwagger(app) {
  const swaggerSpec = combineSwaggerSchemas();
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log('📚 Swagger UI available at http://localhost:3000/api-docs');
}
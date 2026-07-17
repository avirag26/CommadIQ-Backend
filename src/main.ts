import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { APP_CONSTANTS } from './common/constants/app.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.use(helmet());
  app.setGlobalPrefix(APP_CONSTANTS.API_PREFIX);

  app.enableCors({
    origin: configService.getOrThrow<string[]>('app.corsOrigins'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_CONSTANTS.NAME)
    .setDescription(APP_CONSTANTS.TAGLINE)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(APP_CONSTANTS.SWAGGER_PATH, app, document);

  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);

  logger.log(
    `${APP_CONSTANTS.NAME} listening on port ${port} — docs at /${APP_CONSTANTS.SWAGGER_PATH}`,
  );
}

void bootstrap();

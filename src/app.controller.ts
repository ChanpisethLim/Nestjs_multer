import { Controller, Delete, Get, Param, Post, Res, UnsupportedMediaTypeException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { isValidFile, removeFile, saveImageToStorage } from './file_upload.utils';
import { join } from 'path'


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload/:name')
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('name') name: string) {
    const imgPath = join(process.cwd(), `public/images/${name}`, file.filename) 
    const validFile = await isValidFile(imgPath)

    if(!validFile) {
      removeFile(imgPath)
      throw new UnsupportedMediaTypeException('Invalid file')
    }
  }

  @Get('image/:name')
  getImage(@Param('name') name: string, @Res() res) {
    res.sendFile(join(process.cwd(), 'images', name))
  }

  @Delete('image/:img/:name')
  deleteImg(@Param('img') img: string ,@Param('name') name: string) {
    const imgPath = join(__dirname, '..', `public/images/${img}/${name}`)
    removeFile(imgPath)
  }
}

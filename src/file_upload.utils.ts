import { diskStorage } from "multer";
import { extname } from 'path'
import {v4 as uuidv4} from 'uuid'
import { fromFile } from 'file-type'
import { InternalServerErrorException, UnsupportedMediaTypeException } from "@nestjs/common";
import { unlinkSync, mkdirSync, existsSync} from "fs";

type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg'
type validFileExtension = 'png' | 'jpg' | 'jpeg'

const validMimeTypes: validMimeType[] = ['image/png', 'image/jpg', 'image/jpeg']
const validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];

export const saveImageToStorage = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            console.log(req.params)
            // req.body might not have been fully populated yet. It depends on the order that the client transmits fields and files to the server.
            const path = `./public/images/${req.params.name}`
            if (!existsSync(path)){
                mkdirSync(path, {recursive: true})
            }
            cb(null, path)
        },
        filename: (req, file, cb) => {
            const fileExtension: string = extname(file.originalname)
            const filename: string = uuidv4() + fileExtension
            cb(null, filename)
        }
    }),
    fileFilter (req, file, cb) {
        validMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new UnsupportedMediaTypeException("Accept only png/jpg/jpeg"), false)
    }
}

export const isValidFile = async (imgPath: string): Promise<boolean> => {
    const file: any = await fromFile(imgPath)
    const isValidFileExtension: boolean = validFileExtensions.includes(file.ext)
    const isValidFileMimeType: boolean = validMimeTypes.includes(file.mime)

    if(isValidFileMimeType && isValidFileExtension) {
        return true
    }

    return false
}

export const removeFile = (imgPath): void => {
    try {
        unlinkSync(imgPath)
    } catch (error) {
        throw new InternalServerErrorException(error)
    }
}
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type Request, type Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Paciente } from './pacienteEntity.js'
import { AppError, Status } from '../error/ErrorHandler.js'
import { Imagem } from '../imagem/imagemEntity.js'
import { unlinkSync } from 'node:fs'
import { extname, resolve, dirname } from 'path'
import mime from 'mime-types'
import fs from 'fs'

const __filename = import.meta.url.substring(7)
const __dirname = dirname(__filename)

export const criaImagem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params

    console.log('Início da função criaImagem');

    const paciente = await AppDataSource.manager.findOne(Paciente, {
      where: { id },
      relations: {
        imagem: true
      }
    })
    if (paciente == null) {
      return res.status(400).json({ error: 'Paciente não encontrado' })
    }

    if (paciente.imagem != null) {
      throw new AppError('Este paciente já possui uma imagem', Status.BAD_REQUEST)
    }

    if (!req.file) {
      throw new AppError('Arquivo de imagem não fornecido', Status.BAD_REQUEST);
    }

    console.log(req.file)
    const { originalname: nome, size: tamanho, filename: key, url = '' } = req.file

    // Validação antes da criação da instância Imagem
    const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    const maxSize = 10 * 1024 * 1024 // 10MB

    const ext = extname(req.file.originalname).toLowerCase().slice(1)
    console.log(ext) 
    const mimeType = mime.lookup(ext)

    if (!mimeType || !acceptedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ error: 'Formato de imagem inválido' })
      // throw new AppError('Formato de imagem inválido', Status.BAD_REQUEST);
    }

    if (tamanho > maxSize) {
      return res.status(400).json({ error: 'Tamanho máximo de imagem excedido' })
      // throw new AppError('Tamanho máximo de imagem excedido', Status.BAD_REQUEST);
    }

    console.log('Extensão do arquivo:', ext);

    if (mimeType === 'image/svg+xml') {
      const svgContent = fs.readFileSync(req.file.path, 'utf-8')
      const firstLine = svgContent.split('\n')[0]
      console.log(firstLine)
      console.log(req.file.path)
      console.log(svgContent)

      if (/\<script[\s\S]*?\>/s.test(svgContent)) {
        console.log("Cheguei aqui")
        return res.status(400).json({ error: 'Arquivo SVG contém scripts não permitidos' })
        //throw new AppError('Arquivo SVG contém scripts não permitidos', Status.BAD_REQUEST);
      }
    }
    // else {
    //   // Salvar o buffer como um arquivo temporário
    //   const imagePath = resolve(__dirname, '..', '..', 'tmp', 'uploads', key);
    //   await new Promise<void>((resolve, reject) => {
    //     fs.writeFile(imagePath, req.file.buffer, (error) => {
    //       if (error) {
    //         reject(error);
    //       } else {
    //         resolve(undefined);
    //       }
    //     });
    //   });
    
    //   // Ler a imagem usando Jimp
    //   const image = await Jimp.read(req.file.buffer)
    
    //   // Verificar se a imagem foi carregada corretamente
    //   if (!image) {
    //     throw new AppError('Falha ao carregar a imagem', Status.BAD_REQUEST);
    //   }
    
    //   // Verificar se a imagem contém elementos indesejados, como scripts
    //   // Verificar se há texto ou camadas adicionais na imagem
    //   if (image.bitmap && image.bitmap.width > 0 && image.bitmap.height > 0) {
    //     throw new AppError('Imagem contém elementos não permitidos', Status.BAD_REQUEST);
    //   }
    
    //   // Remover o arquivo temporário após o uso
    //   fs.unlink(imagePath, (error) => {
    //     if (error) {
    //       console.error(`Erro ao remover arquivo temporário: ${imagePath}`, error);
    //     }
    //   });
    // }

    // function checkForScripts(node) {
    //   if (node.tagName === 'script') {
    //     return true;
    //   }
    
    //   if (node.children) {
    //     for (const child of node.children) {
    //       if (checkForScripts(child)) {
    //         return true;
    //       }
    //     }
    //   }
    
    //   return false;
    // }


    const imagem = new Imagem()

    imagem.nome = nome
    imagem.tamanho = tamanho
    imagem.key = key
    imagem.url = url

    await AppDataSource.manager.save(Imagem, imagem)

    if (imagem.url === '') {
      imagem.url = resolve(__dirname, ".." , ".." ,"tmp", "uploads", key)
    }

    paciente.imagem = imagem
    await AppDataSource.manager.save(Paciente, paciente)

    return res.json(imagem)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const listaImagemPaciente = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params
  const paciente = await AppDataSource.manager.findOne(Paciente, {
    where: { id },
    relations: {
      imagem: true
    }
  })
  if (paciente == null) {
    throw new AppError('Paciente não encontrado ou não possui imagem', Status.NOT_FOUND)
  }
  return res.json(paciente.imagem)
}

export const destroiImagem = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { pacienteId } = req.params
    const paciente = await AppDataSource.manager.findOne(Paciente, {
      where: { id: pacienteId },
      relations: {
        imagem: true
      }
    })

    if (paciente == null) {
      return res.status(400).json({ error: 'Paciente não encontrado' })
    }

    const imagem = paciente.imagem
    if (!imagem) {
      return res.status(400).json({ error: "Image doesn't exist" })
    }

    unlinkSync(
      resolve(
        __dirname,
        '..',
        '..',
        'tmp',
        'uploads',
          `${imagem.key}`
      )
    )

    await AppDataSource.manager.delete(Imagem, imagem)

    return res.json('Image deleted').status(200)
  } catch (error) {
    return res.status(404).json({ error: error.message })
  }
}

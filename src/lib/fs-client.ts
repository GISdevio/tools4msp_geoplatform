import type { Blob } from 'buffer'
import { createWriteStream, createReadStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'
import { blob } from 'stream/consumers'
import { finished } from 'stream/promises'
import type { ReadableStream } from 'stream/web'

import AdmZip from 'adm-zip'
import { parse } from 'csv-parse/sync'
import mime from 'mime'

export const dataDirPath = path.resolve(process.cwd(), 'data')

export const createDataDir = async (_path: string) => {
  const dirPath = path.resolve(dataDirPath, _path)
  await fs.mkdir(dirPath, { recursive: true })
}

export const deleteDataDir = async (_path: string) => {
  const dirPath = path.resolve(dataDirPath, _path)
  await fs.rm(dirPath, { force: true, recursive: true })
}

export const dumpJson = async (_path: string, data: unknown) => {
  const dirPath = path.resolve(dataDirPath, path.dirname(_path))
  await fs.mkdir(dirPath, { recursive: true })

  const filePath = path.resolve(dataDirPath, `${_path}.json`)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

export const dumpCsv = async (_path: string, data: string) => {
  const dirPath = path.resolve(dataDirPath, path.dirname(_path))
  await fs.mkdir(dirPath, { recursive: true })

  const filePath = path.resolve(dataDirPath, _path)
  await fs.writeFile(filePath, data)
}

export const dumpMd = async (_path: string, data: string) => {
  const dirPath = path.resolve(dataDirPath, path.dirname(_path))
  await fs.mkdir(dirPath, { recursive: true })

  const filePath = path.resolve(dataDirPath, `${_path}.md`)
  await fs.writeFile(filePath, data)
}

export const readJson = async <T = Record<string, unknown>>(_path: string): Promise<T> => {
  const filePath = path.resolve(dataDirPath, _path)
  const fileContent = await fs.readFile(`${filePath}.json`, 'utf-8')
  return JSON.parse(fileContent) as T
}

export const readCsv = async <T = Record<string, string>[]>(_path: string): Promise<T> => {
  const filePath = path.resolve(dataDirPath, _path)
  const fileContent = await fs.readFile(filePath, 'utf-8')
  return parse(fileContent, { columns: true, skip_empty_lines: true }) as T
}

export const saveFile = async (_path: string, data: ReadableStream | null) => {
  if (data === null) { throw new Error('Could not save "null" to file') }

  const dirPath = path.resolve(dataDirPath, path.dirname(_path))
  await fs.mkdir(dirPath, { recursive: true })

  const filePath = path.resolve(dataDirPath, _path)
  const writer = createWriteStream(filePath)

  await finished(Readable.fromWeb(data).pipe(writer))
}

export const readFile = async (_path: string): Promise<Blob> => {
  const filePath = path.resolve(dataDirPath, _path)
  return blob(createReadStream(filePath))
}

export const readFileAsBase64 = async (_path: string): Promise<string> => {
  const filePath = path.resolve(dataDirPath, _path)

  const data = await fs.readFile(filePath, 'base64')
  const mimeType = mime.getType(filePath)

  if (mimeType === null) { throw new Error(`Cannot compute mime type of ${_path}`) }

  return `data:${mimeType};base64,${data}`
}

export const unzip = async (_path: string, data: ReadableStream | null) => {
  if (data === null) { throw new Error('Could not save "null" to file') }

  const dirPath = path.resolve(dataDirPath, _path)
  await fs.mkdir(dirPath, { recursive: true })

  const archivePath = path.resolve(dirPath, 'tmp.zip')
  const archive = createWriteStream(archivePath)

  await finished(Readable.fromWeb(data).pipe(archive))

  const zip = new AdmZip(archivePath)
  zip.extractAllTo(dirPath, true)

  await fs.rm(archivePath, { force: true })
}

export const isDirFull = async (absPath: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(absPath)
    if (!stat.isDirectory()) { return false }

    const files = await fs.readdir(absPath)
    return files.length > 0
  } catch {
    return false
  }
}

import logger from 'node-color-log'

const baseUrl = 'https://geoplatform.tools4msp.eu'

const authHeaders = { Cookie: `csrftoken=${process.env.GEONODE_V3_CSRF_TOKEN}; sessionid=${process.env.GEONODE_V3_SESSION_ID}` }

const getJson = async <T = Record<string, unknown>>(path: string): Promise<T> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  if (!res.ok) {
    logger.error(`V3 call to ${path} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }

  return res.json() as T
}

const getBinary = async (url: string): Promise<[ReadableStream<Uint8Array<ArrayBufferLike>> | null, string | undefined]> => {
  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  if (!res.ok) {
    logger.error(`V3 call to ${url} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }

  const contentDisposition = res.headers.get('content-disposition')
  const filename = contentDisposition?.match(/(filename=|filename\*='')"(.*)"$/)?.[2]

  return [res.body, filename]
}

const getText = async (path: string): Promise<string> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  const text = await res.text()

  if (!res.ok) {
    logger.error(`V3 call to ${path} responded with a ${res.status} status code`)
    throw new Error(text)
  }

  return text
}

export default {
  baseUrl,
  getBinary,
  getJson,
  getText,
}

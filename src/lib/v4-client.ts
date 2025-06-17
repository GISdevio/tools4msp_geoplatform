import jsdom from 'jsdom'
import logger from 'node-color-log'

const baseUrl = process.env.GEONODE_V4_URL

const authHeaders = {
  Cookie: `csrftoken=${process.env.GEONODE_V4_CSRF_TOKEN}; sessionid=${process.env.GEONODE_V4_SESSION_ID}`,
  'X-Csrftoken': process.env.GEONODE_V4_CSRF_TOKEN,
}

const getMiddlewareToken = async (path: string): Promise<string> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }

  const htmlTxt = await res.text()
  const htmlDoc = new jsdom.JSDOM(htmlTxt)

  const input = htmlDoc.window.document.querySelector('input[name="csrfmiddlewaretoken"]')
  if (input === null) { throw new Error('Middleware token input not found') }

  return (input as HTMLInputElement).value
}

const getJson = async <T = Record<string, unknown>>(path: string): Promise<T> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }

  return res.json() as T
}

const getText = async (path: string): Promise<string> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { headers: { ...authHeaders } })

  const text = await res.text()

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)
    throw new Error(text)
  }

  return text
}

const sendJson = async <R>(path: string, body: Record<string, unknown>, method = 'POST'): Promise<R> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, {
    body: JSON.stringify(body),
    headers: { ...authHeaders, 'content-type': 'application/json' },
    method,
  })

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)

    const resContentType = res.headers.get('content-type')
    const isResHtml = resContentType?.split(';').at(0) === 'text/html'

    const text = isResHtml ? `responded with a ${res.status} status code and an HTML payload` : await res.text()
    throw new Error(text)
  }

  return res.json() as R
}

const sendForm = async <R = null>(path: string, data: FormData): Promise<R> => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, { body: data, headers: { ...authHeaders }, method: 'POST' })

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }

  if (res.headers.get('content-type') === 'application/json') {
    return res.json() as R
  }

  return null as R
}

const sendUrlEncodedForm = async (path: string, data: URLSearchParams) => {
  const url = new URL(path, baseUrl)

  const res = await globalThis.fetch(url, {
    body: data,
    headers: { ...authHeaders, 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })

  if (!res.ok) {
    logger.error(`V4 call to ${path} responded with a ${res.status} status code`)

    const text = await res.text()
    throw new Error(text)
  }
}

export default {
  getJson,
  getMiddlewareToken,
  getText,
  sendForm,
  sendJson,
  sendUrlEncodedForm,
}

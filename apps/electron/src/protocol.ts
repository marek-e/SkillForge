import { net, protocol } from 'electron'
import http from 'node:http'
import type { RuntimeEndpointInfo } from './runtime-bridge'

// Must run before app.ready so packaged mode can use skillforge://
export function registerScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'skillforge',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
      },
    },
  ])
}

export function proxyToRuntime(
  req: Request,
  endpoint: RuntimeEndpointInfo | null
): Promise<Response> {
  if (!endpoint) {
    return Promise.resolve(new Response('Runtime not ready', { status: 503 }))
  }

  const url = new URL(req.url)
  const pathname = url.pathname || '/'
  const search = url.search

  if (endpoint.transport === 'tcp' && endpoint.port != null) {
    const target = `http://127.0.0.1:${endpoint.port}${pathname}${search}`
    return net.fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    })
  }

  if (endpoint.transport === 'ipc' && endpoint.ipcPath) {
    return new Promise((resolve, reject) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      const opts: http.RequestOptions = {
        socketPath: endpoint.ipcPath,
        path: pathname + search,
        method: req.method,
        headers,
      }
      const proxy = http.request(opts, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          const headers = new Headers()
          for (const [k, v] of Object.entries(res.headers)) {
            if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 200,
              statusText: res.statusMessage,
              headers,
            })
          )
        })
        res.on('error', reject)
      })
      proxy.on('error', reject)
      const bodyPromise =
        req.method !== 'GET' && req.method !== 'HEAD' && req.body
          ? new Response(req.body).arrayBuffer()
          : Promise.resolve(new ArrayBuffer(0))
      bodyPromise
        .then((buf: ArrayBuffer) => {
          if (buf.byteLength > 0) proxy.write(Buffer.from(buf))
          proxy.end()
        })
        .catch(reject)
    })
  }

  return Promise.resolve(new Response('Bad gateway', { status: 502 }))
}

export function registerProtocolHandler(getEndpoint: () => RuntimeEndpointInfo | null) {
  protocol.handle('skillforge', (req) => proxyToRuntime(req, getEndpoint()))
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GEONODE_V3_CSRF_TOKEN: string
      GEONODE_V3_SESSION_ID: string
      GEONODE_V3_URL: string

      GEONODE_V4_CSRF_TOKEN: string
      GEONODE_V4_SESSION_ID: string
      GEONODE_V4_URL: string
    }
  }
}

export {}

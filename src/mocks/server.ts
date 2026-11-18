import { setupServer } from 'msw/node'
import { createHandlers } from './handlers'

/** Node server for tests. Call `createHandlers()` again with `server.use` to reset state. */
export const server = setupServer(...createHandlers())

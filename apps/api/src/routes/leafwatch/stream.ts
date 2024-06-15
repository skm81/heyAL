import type { Handler } from 'express';

import catchedError from 'src/helpers/catchedError';

let sseClients = require('../../helpers/leafwatch/sseClients');

export const get: Handler = (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients = sseClients.filter((client: any) => client !== res);
    });
  } catch (error) {
    return catchedError(res, error);
  }
};

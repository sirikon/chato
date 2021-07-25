type LogLevel = 'info' | 'error'

function info(message: string, extra?: unknown) {
  _log('info', message, extra);
}

function error(message: string, extra?: unknown) {
  _log('error', message, extra);
}

function _log(level: LogLevel, message: string, extra?: unknown) {
  console.log(`[${level.toUpperCase()}] ${message} ${stringifyExtra(extra)}`);
}

function stringifyExtra(extra? :unknown): string {
  if (!extra) return '';
  if (extra instanceof Error) {
    return JSON.stringify({ message: extra.message, stack: extra.stack });
  }
  return JSON.stringify(extra);
}

export const log = {
  info,
  error
}

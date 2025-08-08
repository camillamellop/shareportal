// Sistema de logging centralizado
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableSentry?: boolean;
}

class Logger {
  private config: LogConfig;

  constructor(config: LogConfig = { level: 'info', enableConsole: true }) {
    this.config = config;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.log(this.formatMessage('debug', message), data);
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.info(this.formatMessage('info', message), data);
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), data);
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      if (this.config.enableConsole) {
        console.error(this.formatMessage('error', message), error);
      }
      
      // Integração futura com Sentry
      // if (this.config.enableSentry && window.Sentry) {
      //   window.Sentry.captureException(error, { 
      //     contexts: { message } 
      //   });
      // }
    }
  }
}

// Instância global do logger
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  enableConsole: true,
});

// Hook para usar o logger em componentes React
export const useLogger = () => {
  return logger;
};

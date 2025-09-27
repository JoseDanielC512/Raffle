type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  action: string;
  data?: unknown;
  error?: unknown;
}

class Logger {
  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private log(level: LogLevel, component: string, action: string, data?: unknown, error?: unknown) {
    // Don't log anything in production
    if (this.isProduction()) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      action,
      data,
      error
    };
    
    console.log(`[${entry.timestamp}] [${level}] [${component}] ${action}:`, data || '', error || '');
  }

  info(component: string, action: string, data?: unknown) {
    this.log('INFO', component, action, data);
  }

  warn(component: string, action: string, data?: unknown) {
    this.log('WARN', component, action, data);
  }

  error(component: string, action: string, error?: unknown, data?: unknown) {
    this.log('ERROR', component, action, data, error);
  }
}

export const logger = new Logger();

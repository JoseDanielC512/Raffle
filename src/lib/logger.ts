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
  private log(level: LogLevel, component: string, action: string, data?: unknown, error?: unknown) {
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

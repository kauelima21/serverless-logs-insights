import chalk from 'chalk';
import { runQuery } from './core/queryTrait';

interface ServerlessInstance {
  service: {
    service: string;
    provider: {
      name?: string;
      region: string;
      stage?: string;
    };
    functions?: Record<
      string,
      {
        name?: string;
        handler?: string;
      }
    >;
    custom?: {
      logsInsights?: {
        queries?: Record<string, string>;
      };
    };
  };
  cli: {
    log: (msg: string) => void;
    consoleLog: (msg: string) => void;
  };
}

interface PluginOptions {
  function: string;
  query?: string;
  interval?: string;
}

class LogsInsightsPlugin {
  serverless: ServerlessInstance;
  options: PluginOptions;

  constructor(serverless: ServerlessInstance, options: PluginOptions) {
    this.serverless = serverless;
    this.options = options;

    this.commands = {
      'logs-insights': {
        usage: 'Run CloudWatch Logs Insights queries for a Lambda function',
        lifecycleEvents: ['run'],
        options: {
          function: {
            usage: 'Lambda function name',
            required: true,
            shortcut: 'f',
            type: 'string',
          },
          query: {
            usage: 'Query key or custom query',
            shortcut: 'q',
            type: 'string',
          },
          interval: {
            usage: 'Time window (e.g. 1h, 6h, 1d)',
            shortcut: 'i',
            type: 'string',
          },
        },
      },
    };

    this.hooks = {
      'logs-insights:run': this.run.bind(this),
    };
  }

  async run(): Promise<void> {
    const { function: fn, query, interval = '1h' } = this.options;

    const functionConfig = this.serverless.service.functions?.[fn];
    const lambdaName =
      functionConfig?.name ??
      `${this.serverless.service.service}-${this.serverless.service.provider.stage}-${fn}`;
    const logGroupName = `/aws/lambda/${lambdaName}`;
    const startTime = Math.floor(Date.now() / 1000) - this.parseDuration(interval);
    const endTime = Math.floor(Date.now() / 1000);

    const customQueries = this.serverless.service.custom?.logsInsights?.queries ?? {};
    const queryString = customQueries[query ?? 'errors'] ?? query ?? 'fields @timestamp, @message | limit 20';

    this.serverless.cli.log(chalk.blue(`🔍 Running query on ${logGroupName}`));

    const results = await runQuery({
      logGroupName,
      queryString,
      startTime,
      endTime,
      region: this.serverless.service.provider.region,
    });

    if (!results || results.length === 0) {
      this.serverless.cli.log(chalk.yellow('⚠️ No results found.'));
      return;
    }

    this.serverless.cli.log(chalk.green(`✅ Query complete. Showing ${results.length} entries:`));
    this.printResults(results);
  }

  parseDuration(str: string): number {
    const match = str.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error('Invalid duration format. Use s/m/h/d (e.g. 1h, 5m).');

    const num = parseInt(match[1]);
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return num * units[match[2]];
  }

  printResults(results: any[]): void {
    for (const row of results) {
      const timestamp = row.find((x: any) => x.field === '@timestamp')?.value ?? '';
      const message = row.find((x: any) => x.field === '@message')?.value ?? '';
      this.serverless.cli.consoleLog(`${chalk.gray(timestamp)}  ${message}`);
    }
  }

  commands: any;
  hooks: any;
}

export default LogsInsightsPlugin;
module.exports = LogsInsightsPlugin;

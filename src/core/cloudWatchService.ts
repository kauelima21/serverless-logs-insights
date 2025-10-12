import { CloudWatchLogsClient, GetQueryResultsCommand, StartQueryCommand } from '@aws-sdk/client-cloudwatch-logs';

type CloudWatchServiceParams = {
  region?: string;
}

type StartQueryParams = {
  logGroupName: string;
  queryString: string;
  startTime: number;
  endTime: number;
}

type GetQueryResultsParams = {
  queryId: string;
}

export class CloudWatchService {
  client: CloudWatchLogsClient;

  constructor({ region }: CloudWatchServiceParams) {
    this.client = new CloudWatchLogsClient({ region: region ?? process.env.AWS_REGION });
  }

  async startQuery({ logGroupName, queryString, startTime, endTime }: StartQueryParams) {
    const startQuery = new StartQueryCommand({
      logGroupName,
      startTime,
      endTime,
      queryString,
    });

    return await this.client.send(startQuery);
  }

  async getQueryResults({ queryId }: GetQueryResultsParams) {
    return await this.client.send(new GetQueryResultsCommand({ queryId }));
  }
}

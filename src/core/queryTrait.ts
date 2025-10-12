import { CloudWatchService } from './cloudWatchService';

type RunQueryParams = {
  logGroupName: string;
  queryString: string;
  startTime: number;
  endTime: number;
  region?: string;
}

export async function runQuery({ logGroupName, queryString, startTime, endTime, region }: RunQueryParams) {
  const service = new CloudWatchService({ region });

  const { queryId } = await service.startQuery({
    logGroupName,
    queryString,
    startTime,
    endTime,
  });

  let result;
  let status = 'Running';
  while (queryId && (status === 'Running' || status === 'Scheduled')) {
    await new Promise(r => setTimeout(r, 1500));

    const { status: newStatus, results } = await service.getQueryResults({ queryId });

    status = newStatus!;
    result = results;
  }

  return result;
}
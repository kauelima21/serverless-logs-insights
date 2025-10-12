# Serverless Logs Insights

Plugin for the Serverless Framework that simplifies advanced queries in AWS CloudWatch Logs Insights directly through the CLI, allowing you to filter, analyze, and visualize Lambda function logs in a practical and efficient way.

## Installation

Add the plugin to your Serverless project:

```bash
npm install --save-dev serverless-logs-insights
```

## Configuration

In your `serverless.yml` file, add the plugin and configure custom queries under `custom.logsInsights.queries`:

```yaml
plugins:
  - serverless-logs-insights

custom:
  logsInsights:
    queries:
      errors: "fields @timestamp, @message | filter @message like /error/ | sort @timestamp desc | limit 20"
      warnings: "fields @timestamp, @message | filter @message like /warn/ | sort @timestamp desc | limit 20"
```

Queries can be customized according to your needs, using the CloudWatch Logs Insights syntax.

## Usage

Run queries directly through the Serverless Framework CLI:

```bash
sls logs-insights -f <function> -q <query> [-i <interval>]
```

### Available Options

| Option             | Description                                                                |
| ------------------ | -------------------------------------------------------------------------- |
| `-f`, `--function` | Name of the Lambda function (as defined in serverless.yml)                 |
| `-q`, `--query`    | Name of the query defined in `custom.logsInsights.queries` or a free query |
| `-i`, `--interval` | Number of recent executions to consider (default: 10)                      |

## Examples

Query the latest errors of a Lambda function named `hello`:

```bash
sls logs-insights -f hello -q errors
```

Run a custom query directly via CLI:

```bash
sls logs-insights -f hello -q "fields @message | filter @message like /timeout/" -i 3h
```

## How does it work?

The plugin uses the AWS SDK to execute queries in CloudWatch Logs Insights, retrieving events from the log groups associated with the Lambda functions in your Serverless project. Results are displayed directly in the terminal in a user-friendly manner.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Developed by Kauê Leal - [github.com/kauelima21](https://github.com/kauelima21)

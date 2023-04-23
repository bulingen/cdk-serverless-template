import * as cdk from "aws-cdk-lib";
import { aws_apigateway, aws_dynamodb } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");

export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, "BackendHandler", {
      entry: "api/dist/handler.js", // NOTE: Using .js file here. Dependency injection breaks when using .ts for some reason.
      handler: "handler",
      bundling: {
        externalModules: [
          "class-transformer",
          "@nestjs/microservices",
          "cache-manager",
          "@nestjs/websockets",
          "class-validator",
        ],
      },
    });

    new aws_apigateway.LambdaRestApi(this, "BackendEndpoint", {
      handler: handler,
    });

    const table = new aws_dynamodb.Table(this, "TemplateTable", {
      partitionKey: { name: "PK", type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: aws_dynamodb.AttributeType.STRING },
      tableName: `cdk-serverless-template-table`,
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    table.grantReadWriteData(handler);
  }
}

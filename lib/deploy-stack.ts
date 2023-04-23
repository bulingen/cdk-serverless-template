import * as cdk from "aws-cdk-lib";
import { aws_apigateway, aws_dynamodb } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import path = require("path");

export class DeployStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const lambdaLayer = new aws_lambda.LayerVersion(this, "BackendLayer", {
    //   code: aws_lambda.Code.fromAsset(
    //     path.join(__dirname, "../api/node_modules")
    //   ),
    //   compatibleRuntimes: [aws_lambda.Runtime.NODEJS_14_X],
    // });

    // const handler = new aws_lambda.Function(this, "BackendHandler", {
    //   runtime: aws_lambda.Runtime.NODEJS_14_X,
    //   code: aws_lambda.Code.fromAsset("../api/dist"),
    //   handler: "handler",
    //   layers: [lambdaLayer],
    //   environment: {
    //     NODE_PATH: "$NODE_PATH:/opt",
    //   },
    // });

    // /home/bulingen/Code/cdk-serverless-template/api/src
    // /home/bulingen/Code/cdk-serverless-template/api/src/handler.ts

    const pathToFile = path.join(__dirname, "../../api/src/handler.ts");
    console.log("BAJS", pathToFile);

    const handler = new NodejsFunction(this, "BackendHandler", {
      // entry: path.join(__dirname, "../api/src/handler.ts"), //"../api/src/handler.ts", // accepts .js, .jsx, .ts, .tsx and .mjs files
      // entry: "../api/src/handler.ts",
      // entry: path.join(
      //   __dirname,
      //   "..",
      //   "/",
      //   "api",
      //   "/",
      //   "src",
      //   "/",
      //   "handler.ts"
      // ),
      // entry: path.join(__dirname, "../api/src/handler.ts"),
      // entry: pathToFile,
      // entry: "api/src/handler.ts",
      entry: "api/dist/handler.js",
      handler: "handler", // defaults to 'handler',
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

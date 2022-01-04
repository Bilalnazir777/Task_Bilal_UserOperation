import type { AWS } from "@serverless/typescript";

import CreateUser from "@functions/CreateUser";
import NewGroup from "@functions/CreateGroup";
import CreateApplication from "@functions/CreateApplication";
import DeleteUser from "@functions/DeleteUser";
import DeleteGroup from "@functions/Deletegroup";
const serverlessConfiguration: AWS = {
  service: "severless-with-error-handling",
  frameworkVersion: "2",
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
    },
    dynamodb: {
      stages: "${self:provider.stage}",
      start: {
        port: 8000,
        migrate: true,
      },
    },
  },
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dynamodb-local",
  ],
  provider: {
    stage: "dev",
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: {
    CreateUser,
    NewGroup,
    CreateApplication,
    DeleteUser,
    DeleteGroup,
  },
  resources: {
    Resources: {
      NameInStack: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "DynamoTable",
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;

//maaz: {
//     Type: "AWS::DynamoDB::Table",
//     Properties: {
//       TableName: "DataBaseTable",
//       BillingMode: "PAY_PER_REQUEST",
//       AttributeDefinitions: [
//         {
//           AttributeName: "id",
//           AttributeType: "S",
//         },
//       ],
//       KeySchema: [
//         {
//           AttributeName: "id",
//           KeyType: "HASH",
//         },
//       ],
//     },
//   },
// },

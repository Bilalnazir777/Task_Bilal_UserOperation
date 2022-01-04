import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import { v4 } from "uuid";
import { savetodb } from "@libs/dynamodb";
const NewUser: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    if (!event.body) {
      return formatJSONResponse(
        {
          error: "Forbidden",
        },
        403
      );
    }
    if (event.body.secretKey == "" || event.body.accessKey == "") {
      return formatJSONResponse(
        {
          error: "unauthorized",
        },
        401
      );
    }
    if (
      !event.body.accessKey ||
      !event.body.consoleUser ||
      !event.body.secretKey ||
      !event.body.systemID ||
      !event.body.groupNames ||
      !event.body.policyNames
    ) {
      return formatJSONResponse(
        {
          error: "Bad request",
        },
        400
      );
    }
    const {
      accessKey,
      consoleUser,
      secretKey,
      systemID,
      groupNames,
      policyNames,
    } = event.body;

    const id = "user" + v4();
    const body = {
      TableName: "DynamoTable",
      Item: {
        accessKey,
        consoleUser,
        secretKey,
        systemID,
        groupNames,
        policyNames,
        id,
      },
    };

    if (
      accessKey == "" ||
      consoleUser == "" ||
      secretKey == "" ||
      systemID == "" ||
      groupNames == "" ||
      policyNames == ""
    ) {
      return formatJSONResponse(
        {
          error: "Bad Request",
        },
        400
      );
    } else {
      const response = await savetodb(body);
      if (response) {
        return formatJSONResponse(
          {
            taskUri: "user created",
          },
          202
        );
      }
    }
  } catch (error) {
    if (error.response.status === 503) {
      return formatJSONResponse(
        {
          message: "service unavailable",
        },
        503
      );
    } else {
      return formatJSONResponse(
        {
          error: "internal server error / unexpected error",
        },
        500
      );
    }
  }
};
export const main = middyfy(NewUser);

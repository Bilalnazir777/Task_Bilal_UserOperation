import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import { v4 } from "uuid";
import { savetodb } from "@libs/dynamodb";
const CreateGroup: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
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
    if (event.body.systemID == "") {
      return formatJSONResponse(
        {
          error: "unauthorized",
        },
        401
      );
    }
    if (
      !event.body.name ||
      !event.body.systemID ||
      !event.body.userNames ||
      !event.body.policyNames
    ) {
      return formatJSONResponse(
        {
          error: "Bad request",
        },
        400
      );
    }
    const { name, systemID, userNames, policyNames } = event.body;
    const id = "group" + v4();
    const body = {
      TableName: "DynamoTable",
      Item: {
        name,
        systemID,
        userNames,
        policyNames,
        id,
      },
    };

    if (name == "" && systemID == "" && userNames == "" && policyNames == "") {
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
            taskUri: "group created",
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
export const main = middyfy(CreateGroup);

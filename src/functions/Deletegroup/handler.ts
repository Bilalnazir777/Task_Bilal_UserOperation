import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { deletefromdb } from "@libs/dynamodb";
import { Handler } from "aws-lambda";

const DeleteGroup: ValidatedEventAPIGatewayProxyEvent<Handler> = async (
  event
) => {
  try {
    const { group } = event.pathParameters;
    if (group === undefined) {
      return formatJSONResponse(
        {
          error: "Forbidden",
        },
        403
      );
    } else if (group === "") {
      return formatJSONResponse(
        {
          error: "bad request",
        },
        400
      );
    }

    const request = {
      TableName: "DynamoTable",
      Key: { id: group },
    };

    const response = await deletefromdb(request);
    if (Object.keys(response).length == 0) {
      return formatJSONResponse(
        {
          message: "group deleted",
        },
        202
      );
    } else {
      return formatJSONResponse(
        {
          message: "unauthorized",
        },
        401
      );
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

export const main = middyfy(DeleteGroup);

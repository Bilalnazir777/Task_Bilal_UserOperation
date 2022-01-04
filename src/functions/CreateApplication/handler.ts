import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import schema from "./schema";
import { savetodb } from "@libs/dynamodb";
import { v4 } from "uuid";
const CreateApplication: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  try {
    if (!event.body) {
      return formatJSONResponse(
        {
          error: "Forbidden",
        },
        403
      );
    }
    if (event.body.subnet == "") {
      return formatJSONResponse(
        {
          error: "unauthorized",
        },
        401
      );
    }
    if (
      !event.body.name ||
      !event.body.subnet ||
      !event.body.roles ||
      !event.body.readPct ||
      !event.body.readIOPs ||
      !event.body.writeIOPs ||
      !event.body.buckets
    ) {
      return formatJSONResponse(
        {
          error: "Bad request",
        },
        400
      );
    }
    const { name, subnet, roles, readPct, readIOPs, writeIOPs, buckets } =
      event.body;
    const id = "application" + v4();
    const body = {
      TableName: "DynamoTable",
      Item: {
        name,
        subnet,
        roles,
        readPct,
        readIOPs,
        writeIOPs,
        buckets,
        id,
      },
    };

    if (
      name == "" &&
      subnet == "" &&
      roles == "" &&
      readPct == null &&
      readIOPs == null &&
      writeIOPs == null &&
      buckets == ""
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
            taskUri: "application created",
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
export const main = middyfy(CreateApplication);

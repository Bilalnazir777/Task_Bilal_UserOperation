import * as AWS from "aws-sdk";

const DynamoDB = process.env.IS_OFFLINE
  ? new AWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    })
  : new AWS.DynamoDB.DocumentClient({});

//saving data to DynamoDataBase
export const savetodb = async (body) => {
  const db_response = await DynamoDB.put(body).promise();
  return db_response;
};
//deleting data from DynamoDataBase
export const deletefromdb = async (body) => {
  const response = await DynamoDB.delete(body).promise();
  return response;
};

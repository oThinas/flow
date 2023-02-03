import express from 'express';
import { ZodSchema } from 'zod';

/**
 * This function is used to parse a request body, params, or query using a Zod schema and
 * handle errors.
 * @param request - express.Request - the request object
 * @param {'body' | 'params' | 'query'} requestExtractor - 'body' | 'params' | 'query'
 * @param response - express.Response,
 * @param schema - ZodSchema<any>
 * @param {string} propertyName - The name of the property that will be returned in the object.

 * @returns ```{ [propertyName]: true }``` if the schema is valid. If not
 * ```{ error: response.status(400).send(errorMessage), [propertyName]: false }```.

 * @description It tries to parse the request body, params, or query using the Zod schema.
 * If it isn't valid, the erros will be simplified before being sent to the client.
 */
export function schemaParser(
  request: express.Request,
  requestExtractor: 'body' | 'params' | 'query',
  response: express.Response,
  schema: ZodSchema<any>,
  propertyName: string,
) {
  try {
    schema.parse(request[requestExtractor]);

    return { [propertyName]: true };
  } catch (error: any) {
    const errorMessage = error.issues.map((issue: { path: string[], message: string }) => ({
      field: issue.path[0],
      message: issue.message,
    }));

    return {
      error: response.status(400).send(errorMessage),
      [propertyName]: false,
    };
  }
}

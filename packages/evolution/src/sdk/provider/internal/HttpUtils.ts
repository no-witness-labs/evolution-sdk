import { HttpClient, HttpClientRequest } from "@effect/platform"
import { Effect, Schema } from "effect"

/**
 * Performs a GET request and decodes the response using the provided schema
 */
export const get = <A, I, R>(url: string, schema: Schema.Schema<A, I, R>, headers?: Record<string, string>) =>
  HttpClient.get(url, headers ? { headers } : undefined).pipe(
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(schema))
  )

/**
 * Performs a POST request with JSON body and decodes the response using the provided schema
 */
export const postJson = <A, I, R>(
  url: string,
  body: unknown,
  schema: Schema.Schema<A, I, R>,
  headers?: Record<string, string>
) =>
  Effect.gen(function* () {
    let request = HttpClientRequest.post(url)
    request = yield* HttpClientRequest.bodyJson(request, body)
    request = HttpClientRequest.setHeaders(request, {
      "Content-Type": "application/json",
      ...(headers || {})
    })

    const response = yield* HttpClient.execute(request)
    const json = yield* response.json
    return yield* Schema.decodeUnknown(schema)(json)
  })

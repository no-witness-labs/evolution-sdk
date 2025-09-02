import { Predicate } from "effect"

export const make = ({ cause, message }: { message?: string; cause?: unknown }) => {
  if (!message && !cause) return { message: `{ "message": "Unknown error occurred" }` }
  if (!message)
    return Predicate.isError(cause)
      ? { message: `{ "message": "${cause.message}" }`, cause }
      : { message: `{ "message": "${String(cause)}" }`, cause }
  if (!cause) return { message: `{ "message": "${message}" }` }

  const causeStr = Predicate.isError(cause) ? cause.message : String(cause)

  return {
    message: `{ "message": "${message}" , "cause": "${causeStr}" }`,
    cause
  }
}

export const makeFromUnknown = ({ cause }: { cause: unknown }) =>
  Predicate.isError(cause)
    ? { message: `{ message: ${cause.message} }`, cause }
    : { message: `{ message: ${String(cause)} }` }

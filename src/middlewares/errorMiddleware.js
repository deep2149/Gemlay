import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientValidationError } from "../generated/prisma/runtime/library.js";
// import { PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";

// Centralized error handler to ensure JSON responses (no HTML error pages)
export default function errorMiddleware(err, req, res, next) {
  // Log for server diagnostics
  // Avoid leaking stack traces in production responses
  console.error("ErrorMiddleware:", err);
  // Zod validation errors
 
  if (err instanceof ZodError || err?.issues) {
    const issues = (err.issues || []).map((i) => ({
      path: i.path,
      message: i.message,
      code: i.code,
    }));
    return res.status(400).json({
      message: "Validation error",
      errors: issues,
    });
  }

  // Prisma errors (KnownRequestError, ValidationError, etc.)
  // We simplify messages to user-friendly text and set appropriate HTTP codes
  console.log( err)
  const prismaCodeLike = typeof err?.code === "string" && /^P\d{4}$/.test(err.code);
  const prismaMessage = typeof err?.message === "string" ? err.message : "";
  const looksLikeUnique = prismaMessage.includes("Unique constraint failed");
  const looksLikeNotFound = prismaMessage.includes("Record to delete does not exist") || prismaMessage.includes("Record to update not found") || prismaMessage.includes("No '") || prismaMessage.includes("not found");
  const looksLikePrisma = prismaCodeLike || looksLikeUnique || looksLikeNotFound || (typeof err?.name === 'string' && err.name.toLowerCase().includes('prisma'));

  if (err instanceof PrismaClientKnownRequestError || looksLikePrisma) {
    console.log("Prisma error detected");
    let code = err.code;
    let status = 400;
    let message = "Database error";

    switch (code) {
      case "P2002": { // Unique constraint failed
        const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : String(err.meta?.target || "unknown");
        status = 409;
        message = `Unique constraint failed on the fields: (${fields})`;
        break;
      }
      case "P2025": { // Record not found
        status = 404;
        message = "Requested record not found";
        break;
      }
      case "P2003": { // Foreign key constraint failed
        status = 409;
        message = "Foreign key constraint failed";
        break;
      }
      case "P2000": { // Value too long for column type
        status = 400;
        message = "Provided value is too long for one of the fields";
        break;
      }
      default: {
        // If no code but message clearly indicates a known case, map it
        if (!code && looksLikeUnique) {
          code = "P2002";
          status = 409;
          const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : String(err.meta?.target || "unknown");
          message = `Unique constraint failed on the fields: (${fields})`;
        } else if (!code && looksLikeNotFound) {
          code = "P2025";
          status = 404;
          message = "Requested record not found";
        } else {
          // Fallback to a trimmed message if available, else a generic label
          message = (err.message || "Prisma error").split("\n").pop()?.trim() || "Prisma error";
        }
      }
    }

    return res.status(status).json({ message, code });
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({ message: "Invalid data provided for database operation", code: "PrismaClientValidationError" });
  }

  if (err instanceof PrismaClientInitializationError) {
    return res.status(500).json({ message: "Database initialization error", code: "PrismaClientInitializationError" });
  }

  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = err.message || "Internal Server Error";
  return res.status(status).json({ message });
}
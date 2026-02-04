import { isClassStaticBlockDeclaration } from "typescript"

export class PdfEctraError extends Error {
  readonly _tag = "PdfReadError"
};

export class InvlidForamat extends Error {
    readonly _tag = "Invalid Data format"
}
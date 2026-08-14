"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
}
exports.NotFoundError = NotFoundError;
class ForbiddenError extends AppError {
}
exports.ForbiddenError = ForbiddenError;

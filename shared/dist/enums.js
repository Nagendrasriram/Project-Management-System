"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPriority = exports.TaskStatus = exports.ProjectStatus = void 0;
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["NOT_STARTED"] = "NOT_STARTED";
    ProjectStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ProjectStatus["COMPLETED"] = "COMPLETED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));

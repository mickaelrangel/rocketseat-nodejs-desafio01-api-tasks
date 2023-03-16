import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const TABLE_NAME = "tasks";
const BODY_VALIDATION_MESSAGE = "Missing title or description";
const TASK_NOT_FOUND_MESSAGE = "Task not found";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: BODY_VALIDATION_MESSAGE }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      database.insert(TABLE_NAME, task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        TABLE_NAME,
        search ? { title: search, description: search } : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: BODY_VALIDATION_MESSAGE }));
      }

      const taskExists = database.update(TABLE_NAME, id, {
        title,
        description,
        updated_at: new Date().toISOString(),
      });

      if (!taskExists) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: TASK_NOT_FOUND_MESSAGE }));
      }

      res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const taskExists = database.delete(TABLE_NAME, id);

      if (!taskExists) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: TASK_NOT_FOUND_MESSAGE }));
      }

      res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const taskExists = database.complete(TABLE_NAME, id);

      if (!taskExists) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: TASK_NOT_FOUND_MESSAGE }));
      }

      res.writeHead(204).end();
    },
  },
];

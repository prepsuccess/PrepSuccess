import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import { listTasksQuerySchema, submitTaskSchema, taskIdParamsSchema } from "./tasks.schemas.js";
import * as tasks from "./tasks.service.js";

export async function list(req: Request, res: Response) {
  const { skill } = listTasksQuerySchema.parse(req.query);
  sendSuccess(req, res, await tasks.listForSkill(req.user!.id, skill));
}

export async function get(req: Request, res: Response) {
  const { id } = taskIdParamsSchema.parse(req.params);
  sendSuccess(req, res, await tasks.getTask(req.user!.id, id));
}

export async function submit(req: Request, res: Response) {
  const { id } = taskIdParamsSchema.parse(req.params);
  const { content } = submitTaskSchema.parse(req.body);
  sendSuccess(req, res, await tasks.submitTask(req.user!.id, id, content), { status: 201 });
}

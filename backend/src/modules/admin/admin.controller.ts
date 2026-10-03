import type { Request, Response } from "express";

import { sendSuccess } from "../../lib/http.js";
import * as content from "./admin.content.service.js";
import {
  createResourceSchema,
  createSkillSchema,
  createTaskSchema,
  idParamsSchema,
  listUsersQuerySchema,
  updateResourceSchema,
  updateSkillSchema,
  updateTaskSchema,
  updateUserSchema,
} from "./admin.schemas.js";
import * as admin from "./admin.service.js";

const idOf = (req: Request) => idParamsSchema.parse(req.params).id;

// ---- Users & analytics

export async function listUsers(req: Request, res: Response) {
  const { users, meta } = await admin.listUsers(listUsersQuerySchema.parse(req.query));
  sendSuccess(req, res, users, { meta });
}

export async function updateUser(req: Request, res: Response) {
  const input = updateUserSchema.parse(req.body);
  sendSuccess(req, res, await admin.updateUser(req.user!.id, idOf(req), input));
}

export async function analytics(req: Request, res: Response) {
  sendSuccess(req, res, await admin.getAnalytics());
}

// ---- Skills

export async function listSkills(req: Request, res: Response) {
  sendSuccess(req, res, await content.listSkills());
}

export async function createSkill(req: Request, res: Response) {
  const input = createSkillSchema.parse(req.body);
  sendSuccess(req, res, await content.createSkill(input), { status: 201 });
}

export async function updateSkill(req: Request, res: Response) {
  const input = updateSkillSchema.parse(req.body);
  sendSuccess(req, res, await content.updateSkill(idOf(req), input));
}

export async function deleteSkill(req: Request, res: Response) {
  sendSuccess(req, res, await content.deleteSkill(idOf(req)));
}

// ---- Resources

export async function listResources(req: Request, res: Response) {
  sendSuccess(req, res, await content.listResources(idOf(req)));
}

export async function createResource(req: Request, res: Response) {
  const input = createResourceSchema.parse(req.body);
  sendSuccess(req, res, await content.createResource(input), { status: 201 });
}

export async function updateResource(req: Request, res: Response) {
  const input = updateResourceSchema.parse(req.body);
  sendSuccess(req, res, await content.updateResource(idOf(req), input));
}

export async function deleteResource(req: Request, res: Response) {
  sendSuccess(req, res, await content.deleteResource(idOf(req)));
}

// ---- Tasks

export async function listTasks(req: Request, res: Response) {
  sendSuccess(req, res, await content.listTasks(idOf(req)));
}

export async function createTask(req: Request, res: Response) {
  const input = createTaskSchema.parse(req.body);
  sendSuccess(req, res, await content.createTask(input), { status: 201 });
}

export async function updateTask(req: Request, res: Response) {
  const input = updateTaskSchema.parse(req.body);
  sendSuccess(req, res, await content.updateTask(idOf(req), input));
}

export async function deleteTask(req: Request, res: Response) {
  sendSuccess(req, res, await content.deleteTask(idOf(req)));
}

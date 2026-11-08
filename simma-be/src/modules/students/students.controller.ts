import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { StudentsService, studentsService } from "./students.service.js";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  StudentQuerySchema,
  IdParamSchema,
  AddStudentParentSchema,
  CreateAndLinkParentSchema,
  AssignClassroomSchema,
} from "./students.schema.js";

function parseData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class StudentsController {
  constructor(
    private readonly service: StudentsService = studentsService,
  ) {}

  getStudents = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(StudentQuerySchema, req.query);
    const result = await this.service.getStudents(query);
    return reply.status(200).send(result);
  };

  getStudentById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getStudentById(id);
    return reply.status(200).send({ data });
  };

  createStudent = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateStudentSchema, req.body);
    const data = await this.service.createStudent(input);
    return reply.status(201).send({ data });
  };

  updateStudent = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateStudentSchema, req.body);
    const userRole = req.user?.role;
    const data = await this.service.updateStudent(id, input, userRole);
    return reply.status(200).send({ data });
  };

  deleteStudent = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteStudent(id);
    return reply.status(204).send();
  };

  getStudentParents = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getStudentParents(id);
    return reply.status(200).send({ data });
  };

  addStudentParent = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = req.body as Record<string, unknown>;

    // If body has 'parent' object, use CreateAndLinkParentSchema
    if (body && typeof body === "object" && "parent" in body) {
      const input = parseData(CreateAndLinkParentSchema, body);
      const data = await this.service.createAndLinkParent(id, input);
      return reply.status(201).send({ data });
    }

    const input = parseData(AddStudentParentSchema, body);
    const data = await this.service.addStudentParent(id, input);
    return reply.status(201).send({ data });
  };

  assignClassroom = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(AssignClassroomSchema, req.body);
    const data = await this.service.assignClassroom(input);
    return reply.status(200).send({ data });
  };
}

export const studentsController = new StudentsController();

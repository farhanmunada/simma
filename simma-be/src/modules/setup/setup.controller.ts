import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { SetupService, setupService } from "./setup.service.js";
import {
  CreateInstitutionSchema,
  UpdateInstitutionSchema,
  CreateAcademicYearSchema,
  UpdateAcademicYearSchema,
  CreateSemesterSchema,
  UpdateSemesterSchema,
  CreateClassroomSchema,
  UpdateClassroomSchema,
  CreateSubjectSchema,
  UpdateSubjectSchema,
  CreateTeacherSchema,
  UpdateTeacherSchema,
  SetupQuerySchema,
  IdParamSchema,
} from "./setup.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class SetupController {
  constructor(private readonly service: SetupService = setupService) {}

  // --- Institutions ---
  getInstitution = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getInstitution();
    return reply.status(200).send({ data });
  };

  getInstitutionById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getInstitutionById(id);
    return reply.status(200).send({ data });
  };

  createInstitution = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateInstitutionSchema, req.body);
    const data = await this.service.createInstitution(input);
    return reply.status(201).send({ data });
  };

  updateInstitution = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateInstitutionSchema, req.body);
    const data = await this.service.updateInstitution(id, input);
    return reply.status(200).send({ data });
  };

  // --- Academic Years ---
  getAcademicYears = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SetupQuerySchema, req.query);
    const result = await this.service.getAcademicYears(query);
    return reply.status(200).send(result);
  };

  getAcademicYearById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getAcademicYearById(id);
    return reply.status(200).send({ data });
  };

  createAcademicYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateAcademicYearSchema, req.body);
    const data = await this.service.createAcademicYear(input);
    return reply.status(201).send({ data });
  };

  updateAcademicYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateAcademicYearSchema, req.body);
    const data = await this.service.updateAcademicYear(id, input);
    return reply.status(200).send({ data });
  };

  deleteAcademicYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteAcademicYear(id);
    return reply.status(204).send();
  };

  setActiveAcademicYear = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.setActiveAcademicYear(id);
    return reply.status(200).send({ data });
  };

  // --- Semesters ---
  getSemesters = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SetupQuerySchema, req.query);
    const result = await this.service.getSemesters(query);
    return reply.status(200).send(result);
  };

  getSemesterById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getSemesterById(id);
    return reply.status(200).send({ data });
  };

  createSemester = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateSemesterSchema, req.body);
    const data = await this.service.createSemester(input);
    return reply.status(201).send({ data });
  };

  updateSemester = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateSemesterSchema, req.body);
    const data = await this.service.updateSemester(id, input);
    return reply.status(200).send({ data });
  };

  deleteSemester = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteSemester(id);
    return reply.status(204).send();
  };

  setActiveSemester = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.setActiveSemester(id);
    return reply.status(200).send({ data });
  };

  // --- Classrooms ---
  getClassrooms = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SetupQuerySchema, req.query);
    const result = await this.service.getClassrooms(query);
    return reply.status(200).send(result);
  };

  getClassroomById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getClassroomById(id);
    return reply.status(200).send({ data });
  };

  createClassroom = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateClassroomSchema, req.body);
    const data = await this.service.createClassroom(input);
    return reply.status(201).send({ data });
  };

  updateClassroom = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateClassroomSchema, req.body);
    const data = await this.service.updateClassroom(id, input);
    return reply.status(200).send({ data });
  };

  deleteClassroom = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteClassroom(id);
    return reply.status(204).send();
  };

  // --- Subjects ---
  getSubjects = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SetupQuerySchema, req.query);
    const result = await this.service.getSubjects(query);
    return reply.status(200).send(result);
  };

  getSubjectById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getSubjectById(id);
    return reply.status(200).send({ data });
  };

  createSubject = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateSubjectSchema, req.body);
    const data = await this.service.createSubject(input);
    return reply.status(201).send({ data });
  };

  updateSubject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateSubjectSchema, req.body);
    const data = await this.service.updateSubject(id, input);
    return reply.status(200).send({ data });
  };

  deleteSubject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteSubject(id);
    return reply.status(204).send();
  };

  // --- Teachers ---
  getTeachers = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SetupQuerySchema, req.query);
    const result = await this.service.getTeachers(query);
    return reply.status(200).send(result);
  };

  getTeacherById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getTeacherById(id);
    return reply.status(200).send({ data });
  };

  createTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateTeacherSchema, req.body);
    const data = await this.service.createTeacher(input);
    return reply.status(201).send({ data });
  };

  updateTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateTeacherSchema, req.body);
    const data = await this.service.updateTeacher(id, input);
    return reply.status(200).send({ data });
  };

  deleteTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteTeacher(id);
    return reply.status(204).send();
  };
}

export const setupController = new SetupController();

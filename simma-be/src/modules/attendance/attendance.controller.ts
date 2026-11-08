import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import {
  AttendanceService,
  attendanceService,
} from "./attendance.service.js";
import {
  RecordStudentAttendanceSchema,
  UpdateStudentAttendanceSchema,
  BulkStudentAttendanceSchema,
  StudentAttendanceQuerySchema,
  RecordTeacherAttendanceSchema,
  UpdateTeacherAttendanceSchema,
  BulkTeacherAttendanceSchema,
  TeacherAttendanceQuerySchema,
  IdParamSchema,
  StudentIdParamSchema,
  TeacherIdParamSchema,
  ClassroomDateParamSchema,
} from "./attendance.schema.js";

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

export class AttendanceController {
  constructor(
    private readonly service: AttendanceService = attendanceService,
  ) {}

  // --- Student Attendance ---

  recordStudent = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(RecordStudentAttendanceSchema, req.body);
    const fallbackTeacherId = req.user?.teacherId;
    const data = await this.service.recordStudentAttendance(
      input,
      fallbackTeacherId,
    );
    return reply.status(201).send({ data });
  };

  bulkRecordStudents = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(BulkStudentAttendanceSchema, req.body);
    const fallbackTeacherId = req.user?.teacherId;
    const data = await this.service.bulkRecordStudentAttendance(
      input,
      fallbackTeacherId,
    );
    return reply.status(200).send({ data });
  };

  getStudentAttendances = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(StudentAttendanceQuerySchema, req.query);
    const result = await this.service.getStudentAttendances(query);
    return reply.status(200).send(result);
  };

  getStudentAttendanceById = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getStudentAttendanceById(id);
    return reply.status(200).send({ data });
  };

  updateStudentAttendance = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateStudentAttendanceSchema, req.body);
    const data = await this.service.updateStudentAttendance(id, input);
    return reply.status(200).send({ data });
  };

  deleteStudentAttendance = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteStudentAttendance(id);
    return reply.status(204).send();
  };

  getClassroomAttendance = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { classId, date } = parseData(
      ClassroomDateParamSchema,
      req.params,
    );
    const data = await this.service.getClassroomAttendance(classId, date);
    return reply.status(200).send({ data });
  };

  getStudentSummary = async (req: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const query = req.query as { startDate?: string; endDate?: string } | undefined;
    const data = await this.service.getStudentAttendanceSummary(
      studentId,
      query?.startDate,
      query?.endDate,
    );
    return reply.status(200).send({ data });
  };

  // --- Teacher Attendance ---

  recordTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(RecordTeacherAttendanceSchema, req.body);
    const data = await this.service.recordTeacherAttendance(input);
    return reply.status(201).send({ data });
  };

  bulkRecordTeachers = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(BulkTeacherAttendanceSchema, req.body);
    const data = await this.service.bulkRecordTeacherAttendance(input);
    return reply.status(200).send({ data });
  };

  getTeacherAttendances = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(TeacherAttendanceQuerySchema, req.query);
    const result = await this.service.getTeacherAttendances(query);
    return reply.status(200).send(result);
  };

  getTeacherAttendanceById = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getTeacherAttendanceById(id);
    return reply.status(200).send({ data });
  };

  updateTeacherAttendance = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateTeacherAttendanceSchema, req.body);
    const data = await this.service.updateTeacherAttendance(id, input);
    return reply.status(200).send({ data });
  };

  deleteTeacherAttendance = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteTeacherAttendance(id);
    return reply.status(204).send();
  };

  getTeacherSummary = async (req: FastifyRequest, reply: FastifyReply) => {
    const { teacherId } = parseData(TeacherIdParamSchema, req.params);
    const query = req.query as { startDate?: string; endDate?: string } | undefined;
    const data = await this.service.getTeacherAttendanceSummary(
      teacherId,
      query?.startDate,
      query?.endDate,
    );
    return reply.status(200).send({ data });
  };
}

export const attendanceController = new AttendanceController();

import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { SchedulesService, schedulesService } from "./schedules.service.js";
import {
  CreateScheduleRoomSchema,
  UpdateScheduleRoomSchema,
  CreateScheduleTimeSlotSchema,
  UpdateScheduleTimeSlotSchema,
  CreateSchedulePlotSchema,
  UpdateSchedulePlotSchema,
  CheckScheduleCollisionSchema,
  ScheduleQueryFilterSchema,
  BatchSchedulePlotSchema,
  ScheduleIdParamSchema,
  MatrixQuerySchema,
  BatchCreateTimeSlotsSchema,
  SchedulePdfQuerySchema,
} from "./schedules.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class SchedulesController {
  constructor(private readonly service: SchedulesService = schedulesService) {}

  // --- Rooms ---
  getRooms = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getRooms();
    return reply.status(200).send({ data, success: true });
  };

  createRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateScheduleRoomSchema, request.body);
    const data = await this.service.createRoom(body);
    return reply.status(201).send({ data, message: "Ruangan berhasil dibuat", success: true });
  };

  updateRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateScheduleRoomSchema, request.body);
    const data = await this.service.updateRoom(id, body);
    return reply.status(200).send({ data, message: "Ruangan berhasil diperbarui", success: true });
  };

  deleteRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deleteRoom(id);
    return reply.status(200).send({ message: "Ruangan berhasil dihapus", success: true });
  };

  // --- Time Slots ---
  getTimeSlots = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { dayOfWeek?: string };
    const data = await this.service.getTimeSlots(query?.dayOfWeek);
    return reply.status(200).send({ data, success: true });
  };

  createTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateScheduleTimeSlotSchema, request.body);
    const data = await this.service.createTimeSlot(body as any);
    return reply.status(201).send({ data, message: "Slot waktu berhasil dibuat", success: true });
  };

  createTimeSlotsBatch = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(BatchCreateTimeSlotsSchema, request.body);
    const data = await this.service.createTimeSlotsBatch(body.slots as any);
    return reply.status(201).send({ data, message: "Batch slot waktu berhasil dibuat", success: true });
  };

  updateTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateScheduleTimeSlotSchema, request.body);
    const data = await this.service.updateTimeSlot(id, body as any);
    return reply.status(200).send({ data, message: "Slot waktu berhasil diperbarui", success: true });
  };

  deleteTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deleteTimeSlot(id);
    return reply.status(200).send({ message: "Slot waktu berhasil dihapus", success: true });
  };

  // --- Schedules Plotting & Collisions ---
  getSchedules = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ScheduleQueryFilterSchema, request.query);
    const data = await this.service.getSchedules(query as any);
    return reply.status(200).send({ data, success: true });
  };

  checkCollision = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CheckScheduleCollisionSchema, request.body);
    const data = await this.service.checkCollision(body as any);
    return reply.status(200).send({ data, success: true });
  };

  createPlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateSchedulePlotSchema, request.body);
    const data = await this.service.createPlot(body as any);
    return reply.status(201).send({ data, message: "Jadwal berhasil diplot", success: true });
  };

  updatePlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateSchedulePlotSchema, request.body);
    const data = await this.service.updatePlot(id, body as any);
    return reply.status(200).send({ data, message: "Jadwal berhasil diperbarui", success: true });
  };

  deletePlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deletePlot(id);
    return reply.status(200).send({ message: "Jadwal berhasil dihapus", success: true });
  };

  batchPlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(BatchSchedulePlotSchema, request.body);
    const data = await this.service.batchPlot(body as any);
    return reply.status(201).send({ data, message: "Plot jadwal batch berhasil", success: true });
  };

  getMatrix = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(MatrixQuerySchema, request.query);
    const data = await this.service.getTimetableMatrix(query);
    return reply.status(200).send({ data, success: true });
  };

  exportPdf = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SchedulePdfQuerySchema, request.query);
    const buffer = await this.service.generatePdf(query);
    return reply
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `inline; filename="jadwal-${query.viewType}-${query.targetId}.pdf"`,
      )
      .send(buffer);
  };
}

export const schedulesController = new SchedulesController();

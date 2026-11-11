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
    return reply.status(200).send({ data });
  };

  createRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateScheduleRoomSchema, request.body);
    const data = await this.service.createRoom(body);
    return reply.status(201).send({ data, message: "Ruangan berhasil dibuat" });
  };

  updateRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateScheduleRoomSchema, request.body);
    const data = await this.service.updateRoom(id, body);
    return reply.status(200).send({ data, message: "Ruangan berhasil diperbarui" });
  };

  deleteRoom = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deleteRoom(id);
    return reply.status(200).send({ message: "Ruangan berhasil dihapus" });
  };

  // --- Time Slots ---
  getTimeSlots = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { dayOfWeek?: string };
    const data = await this.service.getTimeSlots(query?.dayOfWeek);
    return reply.status(200).send({ data });
  };

  createTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateScheduleTimeSlotSchema, request.body);
    const data = await this.service.createTimeSlot(body as any);
    return reply.status(201).send({ data, message: "Slot waktu berhasil dibuat" });
  };

  createTimeSlotsBatch = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(BatchCreateTimeSlotsSchema, request.body);
    const data = await this.service.createTimeSlotsBatch(body.slots as any);
    return reply.status(201).send({ data, message: "Batch slot waktu berhasil dibuat" });
  };

  updateTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateScheduleTimeSlotSchema, request.body);
    const data = await this.service.updateTimeSlot(id, body as any);
    return reply.status(200).send({ data, message: "Slot waktu berhasil diperbarui" });
  };

  deleteTimeSlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deleteTimeSlot(id);
    return reply.status(200).send({ message: "Slot waktu berhasil dihapus" });
  };

  // --- Schedules Plotting & Collisions ---
  getSchedules = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ScheduleQueryFilterSchema, request.query);
    const data = await this.service.getSchedules(query as any);
    return reply.status(200).send({ data });
  };

  checkCollision = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CheckScheduleCollisionSchema, request.body);
    const data = await this.service.checkCollision(body as any);
    return reply.status(200).send({ data });
  };

  createPlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateSchedulePlotSchema, request.body);
    const data = await this.service.createPlot(body as any);
    return reply.status(201).send({ data, message: "Jadwal berhasil diplot" });
  };

  updatePlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    const body = parseData(UpdateSchedulePlotSchema, request.body);
    const data = await this.service.updatePlot(id, body as any);
    return reply.status(200).send({ data, message: "Jadwal berhasil diperbarui" });
  };

  deletePlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ScheduleIdParamSchema, request.params);
    await this.service.deletePlot(id);
    return reply.status(200).send({ message: "Jadwal berhasil dihapus" });
  };

  batchPlot = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(BatchSchedulePlotSchema, request.body);
    const data = await this.service.batchPlot(body as any);
    return reply.status(201).send({ data, message: "Plot jadwal batch berhasil" });
  };

  getMatrix = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(MatrixQuerySchema, request.query);
    const data = await this.service.getTimetableMatrix(query);
    return reply.status(200).send({ data });
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

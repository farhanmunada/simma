import { eq, and, or, ilike, count, desc, isNull, inArray, sql } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  teachers,
  teacherProfiles,
  teacherEducation,
  teacherRanks,
  teacherDocuments,
  teacherWorkloads,
  type Teacher,
  type NewTeacher,
  type TeacherProfile,
  type TeacherEducation,
  type TeacherRankRecord,
  type TeacherDocument,
  type TeacherWorkload,
} from "../../db/schema/index.js";
import type { TeacherQueryParams } from "@simma/shared";
import type { TeacherFullDetail, TeacherWithDetails } from "./teachers.types.js";

export class TeachersRepository {
  async findTeachers(params: TeacherQueryParams): Promise<{ data: TeacherWithDetails[]; total: number }> {
    const db = getDb();
    const conditions = [isNull(teachers.deletedAt)];

    if (params.search) {
      const term = `%${params.search}%`;
      conditions.push(or(ilike(teachers.fullName, term), ilike(teachers.nik, term), ilike(teachers.nuptk, term))!);
    }
    if (params.employmentType) {
      conditions.push(eq(teachers.employmentType, params.employmentType));
    }

    const whereClause = and(...conditions);
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const [totalRow] = await db.select({ count: count() }).from(teachers).where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const teacherRows = await db.select().from(teachers).where(whereClause).limit(limit).offset(offset).orderBy(desc(teachers.createdAt));

    if (teacherRows.length === 0) {
      return { data: [], total };
    }

    const teacherIds = teacherRows.map((t) => t.id);

    const [profiles, ranks, workloads] = await Promise.all([
      db.select().from(teacherProfiles).where(inArray(teacherProfiles.teacherId, teacherIds)),
      db.select().from(teacherRanks).where(and(inArray(teacherRanks.teacherId, teacherIds), eq(teacherRanks.isCurrent, true))),
      db.select().from(teacherWorkloads).where(inArray(teacherWorkloads.teacherId, teacherIds)),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.teacherId, p]));
    const rankMap = new Map(ranks.map((r) => [r.teacherId, r]));
    const workloadMap = new Map(workloads.map((w) => [w.teacherId, w]));

    const data: TeacherWithDetails[] = teacherRows.map((t) => ({
      ...t,
      profile: profileMap.get(t.id) ?? null,
      currentRank: rankMap.get(t.id) ?? null,
      currentWorkload: workloadMap.get(t.id) ?? null,
    }));

    return { data, total };
  }

  async findTeacherById(id: string): Promise<TeacherFullDetail | null> {
    const db = getDb();
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(and(eq(teachers.id, id), isNull(teachers.deletedAt)));

    if (!teacher) return null;

    const [profiles, educations, ranks, documents, workloads] = await Promise.all([
      db.select().from(teacherProfiles).where(eq(teacherProfiles.teacherId, id)),
      db.select().from(teacherEducation).where(eq(teacherEducation.teacherId, id)).orderBy(desc(teacherEducation.graduationYear)),
      db.select().from(teacherRanks).where(eq(teacherRanks.teacherId, id)).orderBy(desc(teacherRanks.tmtRank)),
      db.select().from(teacherDocuments).where(eq(teacherDocuments.teacherId, id)).orderBy(desc(teacherDocuments.createdAt)),
      db.select().from(teacherWorkloads).where(eq(teacherWorkloads.teacherId, id)).orderBy(desc(teacherWorkloads.createdAt)),
    ]);

    return {
      ...teacher,
      profile: profiles[0] ?? null,
      educations,
      ranks,
      documents,
      workloads,
    };
  }

  async findByNik(nik: string): Promise<Teacher | null> {
    const [teacher] = await getDb().select().from(teachers).where(and(eq(teachers.nik, nik), isNull(teachers.deletedAt)));
    return teacher ?? null;
  }

  async findByNuptk(nuptk: string): Promise<Teacher | null> {
    const [teacher] = await getDb().select().from(teachers).where(and(eq(teachers.nuptk, nuptk), isNull(teachers.deletedAt)));
    return teacher ?? null;
  }

  async createTeacherWithProfile(teacherData: NewTeacher, profileData?: Partial<TeacherProfile>): Promise<TeacherFullDetail> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      const [newTeacher] = await tx.insert(teachers).values(teacherData).returning();
      let createdProfile: TeacherProfile | null = null;
      if (profileData) {
        const [profile] = await tx.insert(teacherProfiles).values({
          ...profileData,
          teacherId: newTeacher.id,
          birthDate: profileData.birthDate ? String(profileData.birthDate) : null,
          tmtFirst: profileData.tmtFirst ? String(profileData.tmtFirst) : null,
          tmtPns: profileData.tmtPns ? String(profileData.tmtPns) : null,
        }).returning();
        createdProfile = profile;
      }

      return {
        ...newTeacher,
        profile: createdProfile,
        educations: [],
        ranks: [],
        documents: [],
        workloads: [],
      };
    });
  }

  async updateTeacherWithProfile(
    id: string,
    teacherData: Partial<NewTeacher>,
    profileData?: Partial<TeacherProfile>
  ): Promise<TeacherFullDetail> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      if (Object.keys(teacherData).length > 0) {
        await tx
          .update(teachers)
          .set({ ...teacherData, updatedAt: new Date() })
          .where(eq(teachers.id, id));
      }

      if (profileData && Object.keys(profileData).length > 0) {
        const [existing] = await tx
          .select()
          .from(teacherProfiles)
          .where(eq(teacherProfiles.teacherId, id));

        const formatted = {
          ...profileData,
          birthDate: profileData.birthDate ? String(profileData.birthDate) : undefined,
          tmtFirst: profileData.tmtFirst ? String(profileData.tmtFirst) : undefined,
          tmtPns: profileData.tmtPns ? String(profileData.tmtPns) : undefined,
          updatedAt: new Date(),
        };

        if (existing) {
          await tx
            .update(teacherProfiles)
            .set(formatted)
            .where(eq(teacherProfiles.teacherId, id));
        } else {
          await tx
            .insert(teacherProfiles)
            .values({ ...formatted, teacherId: id });
        }
      }

      const updated = await this.findTeacherById(id);
      return updated!;
    });
  }

  async softDeleteTeacher(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .update(teachers)
      .set({ deletedAt: new Date() })
      .where(eq(teachers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // --- Educations ---
  async createEducation(teacherId: string, data: Omit<typeof teacherEducation.$inferInsert, "teacherId">): Promise<TeacherEducation> {
    const db = getDb();
    const [row] = await db
      .insert(teacherEducation)
      .values({ ...data, teacherId })
      .returning();
    return row;
  }

  async deleteEducation(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(teacherEducation).where(eq(teacherEducation.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  // --- Ranks ---
  async createRank(teacherId: string, data: Omit<typeof teacherRanks.$inferInsert, "teacherId">): Promise<TeacherRankRecord> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      if (data.isCurrent) {
        await tx
          .update(teacherRanks)
          .set({ isCurrent: false })
          .where(eq(teacherRanks.teacherId, teacherId));
      }
      const [row] = await tx
        .insert(teacherRanks)
        .values({
          ...data,
          teacherId,
          skDate: String(data.skDate),
          tmtRank: String(data.tmtRank),
          nextPromotionDate: data.nextPromotionDate ? String(data.nextPromotionDate) : null,
          nextKgbDate: data.nextKgbDate ? String(data.nextKgbDate) : null,
        })
        .returning();
      return row;
    });
  }

  async deleteRank(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(teacherRanks).where(eq(teacherRanks.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  // --- Documents ---
  async createDocument(teacherId: string, data: Omit<typeof teacherDocuments.$inferInsert, "teacherId">): Promise<TeacherDocument> {
    const db = getDb();
    const [row] = await db
      .insert(teacherDocuments)
      .values({
        ...data,
        teacherId,
        issueDate: data.issueDate ? String(data.issueDate) : null,
      })
      .returning();
    return row;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(teacherDocuments).where(eq(teacherDocuments.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  // --- Workloads ---
  async upsertWorkload(data: typeof teacherWorkloads.$inferInsert): Promise<TeacherWorkload> {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(teacherWorkloads)
      .where(
        and(
          eq(teacherWorkloads.teacherId, data.teacherId),
          eq(teacherWorkloads.academicYearId, data.academicYearId),
          eq(teacherWorkloads.semesterId, data.semesterId)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(teacherWorkloads)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teacherWorkloads.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(teacherWorkloads)
      .values(data)
      .returning();
    return created;
  }

  async findAllWorkloads(academicYearId?: string, semesterId?: string): Promise<TeacherWorkload[]> {
    const db = getDb();
    const conditions = [];
    if (academicYearId) conditions.push(eq(teacherWorkloads.academicYearId, academicYearId));
    if (semesterId) conditions.push(eq(teacherWorkloads.semesterId, semesterId));
    return await db.select().from(teacherWorkloads).where(conditions.length ? and(...conditions) : undefined);
  }
}

export const teachersRepository = new TeachersRepository();

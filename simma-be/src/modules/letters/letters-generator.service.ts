import { eq } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import { students } from "../../db/schema/students.js";
import { teachers } from "../../db/schema/setup.js";
import { NotFoundError } from "../../core/errors/index.js";
import { LettersService } from "./letters.service.js";

export class LettersGeneratorService {
  constructor(private lettersService: LettersService = new LettersService()) {}

  async generateStudentActiveLetter(params: {
    studentId: string;
    purpose?: string;
    signerName?: string;
    signerRole?: string;
    signerNip?: string;
    letterDate?: string;
  }) {
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.id, params.studentId)).limit(1);
    if (!student) throw new NotFoundError("Data siswa tidak ditemukan");

    const purpose = params.purpose || "kelengkapan administrasi dan beasiswa";
    const content = `Yang bertanda tangan di bawah ini menerangkan dengan sebenarnya bahwa:\n\n` +
      `Nama Lengkap         : ${student.fullName}\n` +
      `NISN / NIK           : ${student.nisn || "-"} / ${student.nik}\n` +
      `Tempat, Tgl Lahir    : ${student.birthPlace}, ${student.birthDate}\n` +
      `Jenis Kelamin        : ${student.gender === "L" ? "Laki-laki" : "Perempuan"}\n` +
      `Nama Ibu Kandung     : ${student.motherName}\n` +
      `Status Kesiswaan     : Siswa Aktif\n\n` +
      `Adalah benar siswa yang bersangkutan terdaftar aktif belajar pada Madrasah Aliyah kami pada Tahun Ajaran berjalan. ` +
      `Surat Keterangan ini dibuat dan diberikan kepada yang bersangkutan untuk dipergunakan sebagai ${purpose}.\n\n` +
      `Demikian surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`;

    return this.lettersService.createOutgoingLetter({
      templateType: "student_active",
      classificationCode: "PP.00.6",
      subject: `Surat Keterangan Aktif Belajar a.n. ${student.fullName}`,
      recipient: student.fullName,
      contentData: { body: content, purpose, studentName: student.fullName },
      studentId: student.id,
      letterDate: params.letterDate || new Date().toISOString().split("T")[0],
      signerName: params.signerName || "Drs. H. Ahmad Dahlan, M.Pd.I",
      signerRole: params.signerRole || "Kepala Madrasah",
      signerNip: params.signerNip || "197508152002121003",
      securityDegree: "B",
      status: "approved",
    });
  }

  async generateStudentBehaviorLetter(params: {
    studentId: string;
    purpose?: string;
    signerName?: string;
    signerRole?: string;
    signerNip?: string;
    letterDate?: string;
  }) {
    const db = getDb();
    const [student] = await db.select().from(students).where(eq(students.id, params.studentId)).limit(1);
    if (!student) throw new NotFoundError("Data siswa tidak ditemukan");

    const purpose = params.purpose || "persyaratan pendaftaran studi lanjut";
    const content = `Yang bertanda tangan di bawah ini Kepala Madrasah menerangkan bahwa:\n\n` +
      `Nama Lengkap         : ${student.fullName}\n` +
      `NISN / NIK           : ${student.nisn || "-"} / ${student.nik}\n` +
      `Tempat, Tgl Lahir    : ${student.birthPlace}, ${student.birthDate}\n` +
      `Jenis Kelamin        : ${student.gender === "L" ? "Laki-laki" : "Perempuan"}\n\n` +
      `Berdasarkan catatan kesiswaan dan bimbingan konseling kami, siswa yang bersangkutan selama menempuh pendidikan ` +
      `berkelakuan baik, memiliki disiplin tinggi, tidak pernah terlibat tindak kriminalitas, dan bebas dari penyalahgunaan narkoba.\n\n` +
      `Surat keterangan ini diberikan kepada yang bersangkutan untuk dipergunakan sebagai ${purpose}.\n\n` +
      `Demikian surat keterangan ini kami terbitkan untuk digunakan sebagaimana mestinya.`;

    return this.lettersService.createOutgoingLetter({
      templateType: "student_behavior",
      classificationCode: "PP.00.6",
      subject: `Surat Keterangan Berkelakuan Baik (SKKB) a.n. ${student.fullName}`,
      recipient: student.fullName,
      contentData: { body: content, purpose, studentName: student.fullName },
      studentId: student.id,
      letterDate: params.letterDate || new Date().toISOString().split("T")[0],
      signerName: params.signerName || "Drs. H. Ahmad Dahlan, M.Pd.I",
      signerRole: params.signerRole || "Kepala Madrasah",
      signerNip: params.signerNip || "197508152002121003",
      securityDegree: "B",
      status: "approved",
    });
  }

  async generateTeacherDutyLetter(params: {
    teacherId: string;
    assignmentName: string;
    destination: string;
    startDate: string;
    endDate: string;
    transportation?: string;
    budgetSource?: string;
    classificationCode?: string;
    signerName?: string;
    signerRole?: string;
    signerNip?: string;
    letterDate?: string;
  }) {
    const db = getDb();
    const [teacher] = await db.select().from(teachers).where(eq(teachers.id, params.teacherId)).limit(1);
    if (!teacher) throw new NotFoundError("Data GTK / Guru tidak ditemukan");

    const content = `SURAT PERINTAH TUGAS (SPT)\n\n` +
      `Kepala Madrasah memberi tugas kedinasan kepada:\n\n` +
      `Nama Lengkap         : ${teacher.fullName}\n` +
      `NUPTK / NIK          : ${teacher.nuptk || "-"} / ${teacher.nik}\n` +
      `Status Kepegawaian   : ${teacher.employmentType}\n\n` +
      `Untuk Melaksanakan Tugas:\n` +
      `Keperluan / Kegiatan : ${params.assignmentName}\n` +
      `Waktu Pelaksanaan    : ${params.startDate} s/d ${params.endDate}\n` +
      `Tempat Pelaksanaan   : ${params.destination}\n` +
      `Alat Transportasi    : ${params.transportation || "Kendaraan Dinas / Umum"}\n` +
      `Beban Anggaran       : ${params.budgetSource || "DIPA Madrasah Aliyah"}\n\n` +
      `Demikian surat tugas ini diberikan kepada yang bersangkutan untuk dilaksanakan dengan penuh rasa tanggung jawab.`;

    return this.lettersService.createOutgoingLetter({
      templateType: "official_assignment",
      classificationCode: params.classificationCode || "KP.00",
      subject: `Surat Perintah Tugas (SPT) - ${params.assignmentName}`,
      recipient: teacher.fullName,
      contentData: { body: content, teacherName: teacher.fullName, assignmentName: params.assignmentName, destination: params.destination },
      teacherId: teacher.id,
      letterDate: params.letterDate || new Date().toISOString().split("T")[0],
      signerName: params.signerName || "Drs. H. Ahmad Dahlan, M.Pd.I",
      signerRole: params.signerRole || "Kepala Madrasah",
      signerNip: params.signerNip || "197508152002121003",
      securityDegree: "B",
      status: "approved",
    });
  }

  async generateParentInvitationLetter(params: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    agenda: string;
    classroomId?: string;
    gradeLevel?: number;
    classificationCode?: string;
    recipient?: string;
    signerName?: string;
    signerRole?: string;
    signerNip?: string;
    letterDate?: string;
  }) {
    const recipient = params.recipient || "Bapak/Ibu Orang Tua / Wali Siswa";
    const content = `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Puji syukur kita panjatkan ke hadirat Allah SWT atas rahmat dan karunia-Nya. ` +
      `Bersama surat ini, kami mengharap kehadiran Bapak/Ibu Orang Tua / Wali Siswa dalam pertemuan kedinasan madrasah yang akan diselenggarakan pada:\n\n` +
      `Hari / Tanggal  : ${params.eventDate}\n` +
      `Waktu           : ${params.eventTime} WIB s/d Selesai\n` +
      `Tempat          : ${params.eventLocation}\n` +
      `Agenda / Acara  : ${params.agenda}\n\n` +
      `Mengingat pentingnya agenda musyawarah tersebut, kehadiran Bapak/Ibu sangat kami harapkan tepat pada waktunya.\n\n` +
      `Demikian undangan ini kami sampaikan. Atas perhatian dan kehadiran Bapak/Ibu, kami ucapkan terima kasih.\n\n` +
      `Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    return this.lettersService.createOutgoingLetter({
      templateType: "official_invitation",
      classificationCode: params.classificationCode || "HM.00",
      subject: `Undangan: ${params.eventName}`,
      recipient,
      contentData: { body: content, eventName: params.eventName, eventDate: params.eventDate, eventPlace: params.eventLocation },
      letterDate: params.letterDate || new Date().toISOString().split("T")[0],
      signerName: params.signerName || "Drs. H. Ahmad Dahlan, M.Pd.I",
      signerRole: params.signerRole || "Kepala Madrasah",
      signerNip: params.signerNip || "197508152002121003",
      securityDegree: "B",
      status: "approved",
    });
  }
}

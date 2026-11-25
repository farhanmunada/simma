export interface InstitutionWhatsappContacts {
  konsultasi: string;
  pengurusPutra: string;
  pengurusPutri: string;
  bendahara: string;
}

export interface InstitutionSocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface InstitutionEducationLevel {
  code: string;
  title: string;
  summary: string;
}

export interface InstitutionPublicProfile {
  name: string;
  shortName: string;
  status: "negeri" | "swasta";
  akreditasi: string;
  foundedYear: string;
  pengasuh: string;
  headmaster: string;
  address: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  about: string;
  vision: string;
  missions: string[];
  kurikulum: string;
  whatsapp: InstitutionWhatsappContacts;
  social: InstitutionSocialLinks;
  educationLevels: InstitutionEducationLevel[];
  facilities: string[];
  extracurriculars: string[];
  diniyahCurriculum: {
    tsanawiyah: string[];
    aliyah: string[];
  };
}

export interface PpdbPublicInfo {
  academicYear: string;
  academicYearId: string | null;
  activeAcademicYear: { id: string; name: string } | null;
  tracks: Array<{ id: string; name: string }>;
  openTracks: string[];
  majors: string[];
  allowedMajors: string[];
  isOpen: boolean;
  totalApplicants: number;
  institution: InstitutionPublicProfile;
}

export const DEFAULT_INSTITUTION_PUBLIC_PROFILE: InstitutionPublicProfile = {
  name: "PIPP Manba'ul Hikmah",
  shortName: "Manba'ul Hikmah",
  status: "swasta",
  akreditasi: "A",
  foundedYear: "1998",
  pengasuh: "K. Nur Yasin",
  headmaster: "",
  address: "Jl. Kebonsari, Bantengan, Kebonsari, Wonoboyo, Kabupaten Temanggung, Jawa Tengah 56266",
  village: "Kebonsari",
  district: "Wonoboyo",
  city: "Kabupaten Temanggung",
  province: "Jawa Tengah",
  postalCode: "56266",
  phone: "+6285602015153",
  email: "ppsmanbaulhikmah@gmail.com",
  website: "https://pippmanbaulhikmah.com",
  logoUrl: "/images/logo-manbaul-hikmah.png",
  about:
    "Perguruan Islam Pondok Pesantren (PIPP) Manba'ul Hikmah berdiri sejak tahun 1998 di Wonoboyo, Temanggung. Lembaga pendidikan berbasis Islam berasas Al-Qur'an, As-Sunnah, dan Ijma' Qiyas Ulama' Ahlussunnah wal-Jamaah yang memadukan sains (IPTEK) dan ilmu agama (IMTAK).",
  vision:
    "Menjadi lembaga pendidikan Islam yang unggul dan mencetak generasi muslim yang cerdas dan sholih, unggul dalam IMTAK berprestasi dalam IPTEK, serta mencetak mujtahid, mujadid, dan mujahid.",
  missions: [
    "Menyelenggarakan proses belajar mengajar yang menyenangkan, kreatif, dan inovatif dalam segala bidang.",
    "Menumbuhkembangkan akhlak dan sikap amaliah Islam.",
    "Mengembangkan multi kecerdasan secara berimbang.",
    "Membina peningkatan keterampilan selaras dengan perkembangan zaman.",
    "Menanamkan sikap bersungguh-sungguh dalam mencapai tujuan mulia.",
    "Memberikan wawasan baru untuk mengembangkan ilmu pengetahuan dalam segala bidang.",
    "Memperjuangkan kebenaran yang hak sesuai dengan Al-Qur'an dan Al-Hadis.",
  ],
  kurikulum: "Kurikulum Merdeka Kemenag & Kurikulum PonPes Salafiyah",
  whatsapp: {
    konsultasi: "6285602015153",
    pengurusPutra: "6285799218349",
    pengurusPutri: "6282329477596",
    bendahara: "6281578964250",
  },
  social: {
    facebook: "pipp.hikmah",
    instagram: "pipp.manbaulhikmah",
    youtube: "Pipp Manba'ul Hikmah",
  },
  educationLevels: [
    {
      code: "Wustho / MTs",
      title: "Pendidikan Kesetaraan Wustho (Tingkat MTs)",
      summary: "Pendidikan menengah pertama berbasis pesantren dengan fondasi ilmu diniyah dan dasar akademik.",
    },
    {
      code: "MA",
      title: "Madrasah Aliyah (MA)",
      summary: "Pendidikan menengah atas formal Kemenag terintegrasi kurikulum pesantren salafiyah, sains, dan teknologi.",
    },
    {
      code: "ISMA",
      title: "Program ISMA (Isti'dad Madrasah Aliyah)",
      summary: "Program persiapan khusus lulusan SMP/MTs luar PIPP Manba'ul Hikmah dengan kurikulum PonPes Salafiyah.",
    },
  ],
  facilities: [
    "Masjid",
    "Asrama Pesantren",
    "Gedung Sekolah",
    "Perpustakaan",
    "Laboratorium Komputer",
    "Laboratorium Bahasa",
    "Aula Serbaguna",
    "Klinik Kesehatan",
    "Kopontren",
    "Ruang Tamu Wali Santri",
    "MCK / Sanitasi",
  ],
  extracurriculars: [
    "Kajian Kitab-Kitab Salaf",
    "Training Metode Pengajaran Al-Qur'an",
    "Latihan Ceramah 3 Bahasa (Arab, Inggris, Indonesia)",
    "Pendidikan Sains & Teknologi Komputer",
    "Forum Diskusi Ilmiah (Bahtsul Masail)",
    "Training Organisasi & Kepemimpinan",
    "Pramuka",
    "Seni Qashidah / Rebana",
    "Kaligrafi",
    "Teater",
    "Club Olahraga",
    "Keterampilan & Wirausaha (Pertanian & Peternakan)",
  ],
  diniyahCurriculum: {
    tsanawiyah: [
      "Al-Qur'an & Tafsir Juz 30",
      "Hadits (Arba'in Nawawy, Al-Arba'in al-Tarmasy, At-Targhib wa at-Tarhib)",
      "Nahwu & Shorof (Jurumiyah, Imrity, Nahwu Al-Wadih, Amtsilah at-Tashrifiyah)",
      "Fiqih & Tauhid (Durusul Fiqhiyah, Taqrib, Tadzhib, Aqidatul Awam)",
      "Akhlak & Tareh (Ta'lim Muta'allim, Washoya, Khulasoh Nurul Yaqin)",
      "Kajian Wadhifah (Ihya 'Ulumuddin, Tafsir Jalalain, Fatkhul Mu'in, Tarojumah)",
    ],
    aliyah: [
      "Ulumul Qur'an & Tafsir Rowai'ul Bayan",
      "Hadits (Bulughul Marom) & Mustholahul Hadits",
      "Fiqih (Fathul Qorib), Qowa'idul Fiqhiyyah & Usul Fiqih (As-Sulam, Al-Bayan)",
      "Nahwu Lanjut (Alfiyah Ibnu Aqil & Nahwu Al-Wadih Tsanawiyah)",
      "Tasawuf & Akhlak (Minhajul Abidin & Idhotun Nasihin)",
      "Kajian Kitab Tarojumah Syaikh KH Ahmad Rifa'i (Tahyiroh, Ri'ayatul Himmah, Abyanal Khawaij)",
    ],
  },
};

interface RawInstitutionRecord {
  name?: string | null;
  status?: string | null;
  address?: string | null;
  logoPath?: string | null;
  emisData?: Record<string, unknown> | null;
}

function pickStr(val: unknown, fallback: string): string {
  return typeof val === "string" && val.trim().length > 0 ? val.trim() : fallback;
}

export function buildPublicInstitutionProfile(
  raw?: RawInstitutionRecord | null
): InstitutionPublicProfile {
  const emis = (raw?.emisData ?? {}) as Record<string, unknown>;
  const defaults = DEFAULT_INSTITUTION_PUBLIC_PROFILE;
  const missions =
    Array.isArray(emis.missions) && emis.missions.length > 0
      ? emis.missions.filter((m): m is string => typeof m === "string" && m.trim().length > 0)
      : defaults.missions;

  return {
    ...defaults,
    name: pickStr(raw?.name, defaults.name),
    status: raw?.status === "negeri" ? "negeri" : "swasta",
    akreditasi: pickStr(emis.akreditasi, defaults.akreditasi),
    foundedYear: pickStr(emis.foundedYear, defaults.foundedYear),
    pengasuh: pickStr(emis.pengasuh, defaults.pengasuh),
    headmaster: pickStr(emis.headmaster, defaults.headmaster),
    address: pickStr(raw?.address, defaults.address),
    village: pickStr(emis.village, defaults.village),
    district: pickStr(emis.district, defaults.district),
    city: pickStr(emis.city, defaults.city),
    province: pickStr(emis.province, defaults.province),
    postalCode: pickStr(emis.postalCode, defaults.postalCode),
    phone: pickStr(emis.phone, defaults.phone),
    email: pickStr(emis.email, defaults.email),
    website: pickStr(emis.website, defaults.website),
    logoUrl: pickStr(raw?.logoPath, defaults.logoUrl),
    about: pickStr(emis.about, defaults.about),
    vision: pickStr(emis.vision, defaults.vision),
    missions,
    kurikulum: pickStr(emis.kurikulum, defaults.kurikulum),
    whatsapp: {
      konsultasi: pickStr(emis.whatsappKonsultasi, defaults.whatsapp.konsultasi),
      pengurusPutra: pickStr(emis.whatsappPutra, defaults.whatsapp.pengurusPutra),
      pengurusPutri: pickStr(emis.whatsappPutri, defaults.whatsapp.pengurusPutri),
      bendahara: pickStr(emis.whatsappBendahara, defaults.whatsapp.bendahara),
    },
    social: {
      facebook: pickStr(emis.facebook, defaults.social.facebook),
      instagram: pickStr(emis.instagram, defaults.social.instagram),
      youtube: pickStr(emis.youtube, defaults.social.youtube),
    },
  };
}


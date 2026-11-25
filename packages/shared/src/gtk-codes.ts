import type { Role } from "./constants.js";

export const OPERATOR_ROLES: readonly Role[] = ["super_admin", "operator"] as const;

export const GTK_CODE_PREFIX_BY_ROLE: Partial<Record<Role, string>> = {
  super_admin: "10",
  operator: "10",
  kepala_madrasah: "11",
  waka_kurikulum: "12",
  waka_kesiswaan: "13",
  waka_sarpras: "14",
  wali_kelas: "21",
  guru_mapel: "22",
  guru_diniyah: "23",
  guru_tahfidz: "24",
  pembina_ekskul: "25",
  guru_bk: "26",
  guru: "27",
  musyrif: "28",
  admin_tu: "31",
  bendahara: "32",
  pustakawan: "33",
};

export interface GtkRoleOption {
  role: Role;
  prefix: string;
  label: string;
  group: "Pimpinan & Operator" | "Pendidik & Pembina" | "Tenaga Kependidikan";
}

export const GTK_ROLE_OPTIONS: GtkRoleOption[] = [
  { role: "operator", prefix: "10", label: "Operator Madrasah", group: "Pimpinan & Operator" },
  { role: "super_admin", prefix: "10", label: "Super Admin", group: "Pimpinan & Operator" },
  { role: "kepala_madrasah", prefix: "11", label: "Kepala Madrasah", group: "Pimpinan & Operator" },
  { role: "waka_kurikulum", prefix: "12", label: "Waka Kurikulum", group: "Pimpinan & Operator" },
  { role: "waka_kesiswaan", prefix: "13", label: "Waka Kesiswaan", group: "Pimpinan & Operator" },
  { role: "waka_sarpras", prefix: "14", label: "Waka Sarpras", group: "Pimpinan & Operator" },
  { role: "wali_kelas", prefix: "21", label: "Wali Kelas", group: "Pendidik & Pembina" },
  { role: "guru_mapel", prefix: "22", label: "Guru Mapel Formal", group: "Pendidik & Pembina" },
  { role: "guru_diniyah", prefix: "23", label: "Guru Diniyah / Pondok", group: "Pendidik & Pembina" },
  { role: "guru_tahfidz", prefix: "24", label: "Guru Tahfidz", group: "Pendidik & Pembina" },
  { role: "pembina_ekskul", prefix: "25", label: "Pembina Ekstrakurikuler", group: "Pendidik & Pembina" },
  { role: "guru_bk", prefix: "26", label: "Guru BK", group: "Pendidik & Pembina" },
  { role: "guru", prefix: "27", label: "Guru Umum", group: "Pendidik & Pembina" },
  { role: "musyrif", prefix: "28", label: "Musyrif / Pengurus Asrama", group: "Pendidik & Pembina" },
  { role: "admin_tu", prefix: "31", label: "Admin / Staf Tata Usaha", group: "Tenaga Kependidikan" },
  { role: "bendahara", prefix: "32", label: "Bendahara", group: "Tenaga Kependidikan" },
  { role: "pustakawan", prefix: "33", label: "Pustakawan", group: "Tenaga Kependidikan" },
];

export function getGtkPrefixForRole(role: Role): string {
  return GTK_CODE_PREFIX_BY_ROLE[role] ?? "27";
}

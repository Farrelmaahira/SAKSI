# SAKSI Frontend — Atomic Design Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi struktur komponen Atomic Design pada `frontend/` SAKSI agar seluruh UI dapat dikembangkan secara konsisten, modular, dan dapat diuji secara mandiri—mulai dari token desain (atoms) hingga halaman penuh (pages) sesuai 7 alur kerja SAKSI.

**Architecture:** Kaidah Atomic Design diterapkan di atas Next.js 16.x App Router dengan layer: `atoms` → `molecules` → `organisms` → `templates` → `pages` (App Router `/app`). Setiap layer di-co-locate di `src/components/<layer>/`. Token desain global (warna, tipografi, spacing) dikelola di `globals.css` dengan CSS Custom Properties Tailwind v4. Tidak ada komponen yang skip layer: molecule wajib kompos dari atoms, organism dari molecules.

**Tech Stack:**
- Next.js 16.x + App Router (TypeScript)
- Tailwind CSS v4 (`@tailwindcss/turbopack`)
- Lucide Icons (ikon legal/audit)
- React 19

**Spec:** [README.md](file:///d:/Farrel/PROJECTS/SAKSI/README.md) & [2026-10-23-saksi-core-platform.md](file:///d:/Farrel/PROJECTS/SAKSI/docs/superpowers/plans/2026-10-23-saksi-core-platform.md)

---

## Global Constraints

- Next.js versi 16.x—baca `node_modules/next/dist/docs/` sebelum menulis kode (lihat `AGENTS.md` di `frontend/`).
- Semua komponen wajib TypeScript strict; tidak ada `any` implisit.
- Tailwind v4 menggunakan sintaks CSS-native (`@theme inline`, `@layer`), bukan `tailwind.config.js`.
- Atomic layer dikelola di `frontend/src/components/{atoms,molecules,organisms,templates}`.
- Halaman (pages) tetap di `frontend/src/app/**` sesuai konvensi App Router—bukan di `components/`.
- Token warna wajib merujuk CSS Custom Properties yang didefinisikan di `globals.css`:
  - `--color-integrity`: aksen segel (hijau emerald)
  - `--color-legal`: aksen legalitas (navy blue)
  - `--color-warning`: peringatan klausul hilang (kuning amber)
  - `--color-danger`: pelanggaran / tamper (merah)
- Nama file komponen: PascalCase. Barrel export per folder via `index.ts`.
- Setiap komponen wajib memiliki props interface yang diekspor.

---

## Review Focus

1. **Atom yang terlalu besar:** Sebuah atom yang menerima banyak props logika bisnis (mis. `onClick` bercampur dengan state) adalah molekul yang salah tempat — uji bahwa setiap atom hanya menerima presentasi props.
2. **Template yang bocor ke App Router:** Template adalah layout tanpa data — pastikan tidak ada `fetch()` atau `useEffect` di layer template; data fetching hanya di App Router pages/layouts.
3. **Barrel export circular:** `index.ts` yang saling import antar layer (organism mengimpor dari templates) akan menyebabkan runtime error—uji build clean setiap task.
4. **Token warna tidak konsisten:** Komponen yang hardcode hex langsung (bukan CSS variable) akan pecah saat tema berubah—uji dengan `grep` untuk literal hex di luar `globals.css`.
5. **Aksesibilitas role hilang:** Form multi-step dan badge segel tanpa `aria-label` / `role` akan gagal screen reader—uji dengan validasi a11y di setiap organism form.

---

## File Structure

```
frontend/src/
├── app/
│   ├── globals.css                          ← Token desain & theme (DIMODIFIKASI)
│   ├── layout.tsx                           ← Root layout (DIMODIFIKASI)
│   ├── page.tsx                             ← Landing page SAKSI (DIMODIFIKASI)
│   ├── kontrak/
│   │   ├── baru/page.tsx                    ← Halaman wizard buat kontrak
│   │   └── [id]/page.tsx                    ← Halaman detail & review kontrak
│   ├── transparansi/
│   │   ├── page.tsx                         ← Portal publik kontrak
│   │   └── [id]/page.tsx                    ← Detail kontrak publik
│   └── lapor/
│       └── page.tsx                         ← Formulir pelaporan warga
├── components/
│   ├── atoms/
│   │   ├── Button/Button.tsx
│   │   ├── Badge/Badge.tsx                  ← variant: integrity | legal | warning | danger
│   │   ├── Input/Input.tsx
│   │   ├── Textarea/Textarea.tsx
│   │   ├── Label/Label.tsx
│   │   ├── Spinner/Spinner.tsx
│   │   ├── Icon/Icon.tsx                    ← Wrapper Lucide Icon
│   │   ├── Divider/Divider.tsx
│   │   └── index.ts                         ← Barrel semua atoms
│   ├── molecules/
│   │   ├── FormField/FormField.tsx          ← Label + Input + error message
│   │   ├── StatusBadgeGroup/StatusBadgeGroup.tsx
│   │   ├── ContractCard/ContractCard.tsx    ← Card ringkasan kontrak publik
│   │   ├── ClauseItem/ClauseItem.tsx        ← Satu pasal + badge audit AI
│   │   ├── StepIndicator/StepIndicator.tsx  ← Progress wizard
│   │   ├── HashVerifier/HashVerifier.tsx    ← Input hash + tombol verifikasi
│   │   ├── NavLink/NavLink.tsx
│   │   └── index.ts
│   ├── organisms/
│   │   ├── Navbar/Navbar.tsx
│   │   ├── Footer/Footer.tsx
│   │   ├── QuestionnaireWizard/
│   │   │   ├── QuestionnaireWizard.tsx      ← Wizard multi-step Smart Q&A
│   │   │   └── steps/
│   │   │       ├── StepKategori.tsx
│   │   │       ├── StepPihak.tsx
│   │   │       ├── StepNilai.tsx
│   │   │       └── StepReview.tsx
│   │   ├── ClauseEditor/ClauseEditor.tsx
│   │   ├── IntegrityPanel/IntegrityPanel.tsx ← Panel segel hash + status
│   │   ├── ContractList/ContractList.tsx
│   │   ├── ReportForm/ReportForm.tsx
│   │   └── index.ts
│   ├── templates/
│   │   ├── DashboardTemplate/DashboardTemplate.tsx ← Navbar + slot + Footer
│   │   ├── PublicPortalTemplate/PublicPortalTemplate.tsx
│   │   ├── WizardTemplate/WizardTemplate.tsx
│   │   └── index.ts
└── types/
    └── contract.ts                          ← Tipe data Contract, Clause, AuditResult, Report
```

---

### Task 1: Token Desain & CSS Foundation

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/layout.tsx`

**Interfaces:**
- Consumes: Nothing
- Produces:
  - CSS Custom Properties: `--color-integrity`, `--color-legal`, `--color-warning`, `--color-danger`, `--color-surface`, `--color-surface-muted`
  - Tailwind v4 `@theme inline` mapping untuk semua token warna SAKSI
  - Font: Inter dari Google Fonts (via `next/font/google`)

- [ ] **Step 1: Tambahkan Google Font (Inter) di `layout.tsx`**

  ```tsx
  import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
  ```

  Wrap `<body>` dengan `className={inter.variable}`.

- [ ] **Step 2: Definisikan token warna SAKSI di `globals.css`**

  ```css
  :root {
    --color-integrity: #059669;   /* emerald-600 */
    --color-legal: #1e3a5f;       /* navy blue */
    --color-warning: #d97706;     /* amber-600 */
    --color-danger: #dc2626;      /* red-600 */
    --color-surface: #f8fafc;
    --color-surface-muted: #f1f5f9;
    --color-text-primary: #0f172a;
    --color-text-muted: #64748b;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: #0f172a;
      --color-surface-muted: #1e293b;
      --color-text-primary: #f1f5f9;
      --color-text-muted: #94a3b8;
    }
  }
  ```

- [ ] **Step 3: Daftarkan token ke Tailwind v4 `@theme inline`**

  Tambahkan di `globals.css`:
  ```css
  @theme inline {
    --color-integrity: var(--color-integrity);
    --color-legal: var(--color-legal);
    --color-warning: var(--color-warning);
    --color-danger: var(--color-danger);
    --color-surface: var(--color-surface);
    --color-surface-muted: var(--color-surface-muted);
    --font-sans: var(--font-sans);
  }
  ```

- [ ] **Step 4: Verifikasi build clean**

  Run: `npm run build` di `frontend/`
  Expected: Build sukses tanpa error TypeScript.

- [ ] **Step 5: Commit**

  ```bash
  git add frontend/src/app/globals.css frontend/src/app/layout.tsx
  git commit -m "feat(frontend): add SAKSI design tokens and Inter font"
  ```

---

### Task 2: Definisi Tipe Data & Barrel Setup

**Files:**
- Create: `frontend/src/types/contract.ts`
- Create: `frontend/src/components/atoms/index.ts` *(barrel kosong — diisi per task)*
- Create: `frontend/src/components/molecules/index.ts`
- Create: `frontend/src/components/organisms/index.ts`
- Create: `frontend/src/components/templates/index.ts`

**Interfaces:**
- Consumes: Nothing
- Produces:
  - `ContractStatus: "DRAFT" | "AI_AUDITED" | "PENDING_SIGNATURE" | "SIGNED" | "PUBLISHED"`
  - `ContractCategory: "INFRASTRUKTUR_DESA" | "PENGADAAN_UMKM" | "JASA_FREELANCER"`
  - `Contract { id, title, category, partyA, partyB, value, status, documentHash, signedAt, redactedContent }`
  - `Clause { id, title, content, auditStatus: "COMPLETE" | "INCOMPLETE" | "MISSING" }`
  - `AuditResult { clauseChecks: ClauseCheck[], overallScore: number, missingClauses: string[] }`
  - `Report { id, contractId, description, evidenceUrls, isAnonymous, createdAt }`

- [ ] **Step 1: Tulis `contract.ts` dengan semua tipe yang diproduksi**

  Setiap interface diekspor secara named export. `ContractCategory` berisi literal union seperti di Produces.

- [ ] **Step 2: Buat barrel `index.ts` kosong untuk setiap layer komponen**

  Cukup file dengan komentar `// re-exports added per task`.

- [ ] **Step 3: Verifikasi TypeScript**

  Run: `npx tsc --noEmit` di `frontend/`
  Expected: 0 error.

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/src/types/ frontend/src/components/
  git commit -m "feat(frontend): define contract domain types and component layer barrels"
  ```

---

### Task 3: Atoms — Komponen Dasar UI

**Files:**
- Create: `frontend/src/components/atoms/Button/Button.tsx`
- Create: `frontend/src/components/atoms/Button/index.ts`
- Create: `frontend/src/components/atoms/Badge/Badge.tsx`
- Create: `frontend/src/components/atoms/Badge/index.ts`
- Create: `frontend/src/components/atoms/Input/Input.tsx`
- Create: `frontend/src/components/atoms/Input/index.ts`
- Create: `frontend/src/components/atoms/Textarea/Textarea.tsx`
- Create: `frontend/src/components/atoms/Textarea/index.ts`
- Create: `frontend/src/components/atoms/Label/Label.tsx`
- Create: `frontend/src/components/atoms/Label/index.ts`
- Create: `frontend/src/components/atoms/Spinner/Spinner.tsx`
- Create: `frontend/src/components/atoms/Spinner/index.ts`
- Create: `frontend/src/components/atoms/Icon/Icon.tsx`
- Create: `frontend/src/components/atoms/Icon/index.ts`
- Create: `frontend/src/components/atoms/Divider/Divider.tsx`
- Create: `frontend/src/components/atoms/Divider/index.ts`
- Modify: `frontend/src/components/atoms/index.ts`

**Interfaces:**
- Consumes: Token CSS dari Task 1
- Produces:
  - `ButtonProps { variant: "primary" | "secondary" | "ghost" | "danger"; size: "sm" | "md" | "lg"; isLoading?: boolean; children: React.ReactNode; } & React.ButtonHTMLAttributes<HTMLButtonElement>`
  - `BadgeProps { variant: "integrity" | "legal" | "warning" | "danger" | "neutral"; label: string; }`
  - `InputProps extends React.InputHTMLAttributes<HTMLInputElement> { error?: string; }`
  - `TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { error?: string; }`
  - `LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { required?: boolean; }`
  - `SpinnerProps { size?: "sm" | "md" | "lg"; }`
  - `IconProps { name: string; size?: number; className?: string; }`
  - `DividerProps { label?: string; }`

- [ ] **Step 1: Implementasikan `Button.tsx`**

  Gunakan Tailwind classes merujuk token `--color-integrity` (variant primary) dan `--color-legal` (variant secondary). Saat `isLoading`, tampilkan `<Spinner size="sm" />` inline dan disable button. Ekspor `ButtonProps`.

- [ ] **Step 2: Implementasikan `Badge.tsx`**

  Map `variant` ke CSS class warna token: `integrity → bg-integrity text-white`, `warning → bg-warning text-white`, dst. Tidak ada logika—hanya presentasi.

- [ ] **Step 3: Implementasikan `Input.tsx` dan `Textarea.tsx`**

  Saat `error` prop ada, border berubah ke `border-danger`. Gunakan `forwardRef` agar form library dapat mengintegrasikannya.

- [ ] **Step 4: Implementasikan `Label.tsx`, `Spinner.tsx`, `Icon.tsx`, `Divider.tsx`**

  - `Label`: tambahkan `*` merah jika `required`.
  - `Spinner`: SVG animasi rotate dengan ukuran dari props.
  - `Icon`: wrapper Lucide React—install jika belum: `npm install lucide-react` di `frontend/`.
  - `Divider`: garis horizontal dengan label teks opsional di tengah.

- [ ] **Step 5: Tambahkan semua atoms ke barrel `atoms/index.ts`**

  ```ts
  export * from "./Button";
  export * from "./Badge";
  // ... semua atoms
  ```

- [ ] **Step 6: Verifikasi TypeScript**

  Run: `npx tsc --noEmit` di `frontend/`
  Expected: 0 error.

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/components/atoms/
  git commit -m "feat(frontend): implement atomic design atoms (Button, Badge, Input, etc)"
  ```

---

### Task 4: Molecules — Komposisi Atoms

**Files:**
- Create: `frontend/src/components/molecules/FormField/FormField.tsx`
- Create: `frontend/src/components/molecules/FormField/index.ts`
- Create: `frontend/src/components/molecules/StatusBadgeGroup/StatusBadgeGroup.tsx`
- Create: `frontend/src/components/molecules/StatusBadgeGroup/index.ts`
- Create: `frontend/src/components/molecules/ContractCard/ContractCard.tsx`
- Create: `frontend/src/components/molecules/ContractCard/index.ts`
- Create: `frontend/src/components/molecules/ClauseItem/ClauseItem.tsx`
- Create: `frontend/src/components/molecules/ClauseItem/index.ts`
- Create: `frontend/src/components/molecules/StepIndicator/StepIndicator.tsx`
- Create: `frontend/src/components/molecules/StepIndicator/index.ts`
- Create: `frontend/src/components/molecules/HashVerifier/HashVerifier.tsx`
- Create: `frontend/src/components/molecules/HashVerifier/index.ts`
- Create: `frontend/src/components/molecules/NavLink/NavLink.tsx`
- Create: `frontend/src/components/molecules/NavLink/index.ts`
- Modify: `frontend/src/components/molecules/index.ts`

**Interfaces:**
- Consumes: Semua atoms dari `@/components/atoms`, `Contract` & `Clause` types dari `@/types/contract`
- Produces:
  - `FormFieldProps { label: string; required?: boolean; error?: string; children: React.ReactNode; htmlFor: string; }`
  - `StatusBadgeGroupProps { status: ContractStatus; }`
  - `ContractCardProps { contract: Pick<Contract, "id" | "title" | "category" | "status" | "partyA" | "partyB" | "value"> }`
  - `ClauseItemProps { clause: Clause; onEdit?: (id: string) => void; readOnly?: boolean; }`
  - `StepIndicatorProps { currentStep: number; totalSteps: number; stepLabels: string[]; }`
  - `HashVerifierProps { recordedHash: string; onVerify: (fileHash: string) => Promise<boolean>; }`
  - `NavLinkProps { href: string; label: string; isActive?: boolean; iconName?: string; }`

- [ ] **Step 1: Implementasikan `FormField.tsx`**

  Komposisi: `<Label htmlFor>` + `children` (slot Input/Textarea) + pesan error. Tidak ada state internal.

- [ ] **Step 2: Implementasikan `ContractCard.tsx`**

  Komposisi: judul kontrak, nama pihak, nilai, dan `<StatusBadgeGroup status />`. Wrapper `<article>` dengan `role="article"`. Link ke `/kontrak/[id]`.

- [ ] **Step 3: Implementasikan `ClauseItem.tsx`**

  Komposisi: nomor pasal, judul, konten, dan `<Badge variant={clause.auditStatus === "COMPLETE" ? "integrity" : "warning"}>`. Tampilkan tombol edit (ikon pensil) jika `!readOnly`.

- [ ] **Step 4: Implementasikan `StepIndicator.tsx`**

  Komposisi: baris lingkaran bernomor + label, styling step aktif vs selesai vs mendatang. Tidak ada state—terima `currentStep` sebagai props.

- [ ] **Step 5: Implementasikan `HashVerifier.tsx`**

  Komposisi: `<Input>` untuk paste hash + `<Button>` verifikasi + `<Badge>` hasil (hijau/merah). Handle `onVerify` async dengan loading state internal (satu-satunya state yang diizinkan di molecules).

- [ ] **Step 6: Implementasikan `StatusBadgeGroup.tsx` dan `NavLink.tsx`**

  - `StatusBadgeGroup`: mapping `ContractStatus` ke `<Badge variant>`.
  - `NavLink`: Next.js `<Link>` + `<Icon>` + label, `aria-current="page"` jika aktif.

- [ ] **Step 7: Update barrel `molecules/index.ts`**

- [ ] **Step 8: Verifikasi TypeScript**

  Run: `npx tsc --noEmit`
  Expected: 0 error.

- [ ] **Step 9: Commit**

  ```bash
  git add frontend/src/components/molecules/
  git commit -m "feat(frontend): implement atomic design molecules (FormField, ContractCard, ClauseItem, etc)"
  ```

---

### Task 5: Organisms — Fitur SAKSI Terkomposisi

**Files:**
- Create: `frontend/src/components/organisms/Navbar/Navbar.tsx`
- Create: `frontend/src/components/organisms/Navbar/index.ts`
- Create: `frontend/src/components/organisms/Footer/Footer.tsx`
- Create: `frontend/src/components/organisms/Footer/index.ts`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/QuestionnaireWizard.tsx`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/steps/StepKategori.tsx`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/steps/StepPihak.tsx`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/steps/StepNilai.tsx`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/steps/StepReview.tsx`
- Create: `frontend/src/components/organisms/QuestionnaireWizard/index.ts`
- Create: `frontend/src/components/organisms/ClauseEditor/ClauseEditor.tsx`
- Create: `frontend/src/components/organisms/ClauseEditor/index.ts`
- Create: `frontend/src/components/organisms/IntegrityPanel/IntegrityPanel.tsx`
- Create: `frontend/src/components/organisms/IntegrityPanel/index.ts`
- Create: `frontend/src/components/organisms/ContractList/ContractList.tsx`
- Create: `frontend/src/components/organisms/ContractList/index.ts`
- Create: `frontend/src/components/organisms/ReportForm/ReportForm.tsx`
- Create: `frontend/src/components/organisms/ReportForm/index.ts`
- Modify: `frontend/src/components/organisms/index.ts`

**Interfaces:**
- Consumes: Molecules dari `@/components/molecules`, tipe dari `@/types/contract`
- Produces:
  - `NavbarProps { activePath: string; }`
  - `QuestionnaireWizardProps { onSubmit: (payload: QuestionnairePayload) => Promise<void>; }`
  - `QuestionnairePayload { category: ContractCategory; partyA: PartyInfo; partyB: PartyInfo; value: number; deadline: string; paymentTerms: string; }`
  - `PartyInfo { name: string; role: string; identifier: string; }`
  - `ClauseEditorProps { clauses: Clause[]; onClauseChange: (updated: Clause) => void; readOnly?: boolean; }`
  - `IntegrityPanelProps { documentHash: string; contractId: string; status: ContractStatus; }`
  - `ContractListProps { contracts: ContractCardProps["contract"][]; isLoading?: boolean; }`
  - `ReportFormProps { contractId: string; onSubmit: (report: Omit<Report, "id" | "createdAt">) => Promise<void>; }`

- [ ] **Step 1: Implementasikan `Navbar.tsx`**

  Komposisi: logo "SAKSI" dengan aksen `text-integrity` + baris `<NavLink>` untuk: Buat Kontrak, Transparansi Publik, Verifikasi Segel, Lapor. `activePath` di-compare dengan `usePathname()` dari `next/navigation`.

- [ ] **Step 2: Implementasikan `Footer.tsx`**

  Teks copyright, link ke panduan, dan badge "Segel Integritas Platform". Tidak ada state.

- [ ] **Step 3: Implementasikan `QuestionnaireWizard.tsx` dan 4 steps**

  State internal: `currentStep: number`, `formData: Partial<QuestionnairePayload>`. `StepKategori` menampilkan 3 pilihan kategori sebagai kartu seleksi visual. `StepPihak` menggunakan dua `<FormField>` untuk pihak A & B. `StepNilai` menggunakan `<FormField type="number">`. `StepReview` menampilkan ringkasan read-only sebelum submit. Navigasi via `<Button>` Lanjut/Kembali dengan `<StepIndicator>`.

- [ ] **Step 4: Implementasikan `ClauseEditor.tsx`**

  Daftar `<ClauseItem>` dari props `clauses`. Saat `onClauseChange`, jalankan callback ke parent. Tampilkan ringkasan audit di atas (jumlah pasal lengkap/tidak).

- [ ] **Step 5: Implementasikan `IntegrityPanel.tsx`**

  Tampilkan hash SHA-256 dalam `<code>` blok, status segel (`Badge`), dan `<HashVerifier>` untuk verifikasi mandiri. Saat status `SIGNED`, tampilkan timestamp penandatanganan.

- [ ] **Step 6: Implementasikan `ContractList.tsx`**

  Render grid `<ContractCard>` dari array contracts. Saat `isLoading`, render skeleton (3 div animasi pulse). Saat array kosong, render empty state dengan ikon dan teks.

- [ ] **Step 7: Implementasikan `ReportForm.tsx`**

  Komposisi: `<FormField>` untuk deskripsi (Textarea) + upload bukti foto + checkbox "Laporkan secara Anonim" + `<Button type="submit">`. Saat anonim dicentang, tampilkan disclaimer enkripsi identitas.

- [ ] **Step 8: Update barrel `organisms/index.ts`**

- [ ] **Step 9: Verifikasi build**

  Run: `npm run build` di `frontend/`
  Expected: Build sukses.

- [ ] **Step 10: Commit**

  ```bash
  git add frontend/src/components/organisms/
  git commit -m "feat(frontend): implement organisms (Navbar, QuestionnaireWizard, ClauseEditor, IntegrityPanel, ContractList, ReportForm)"
  ```

---

### Task 6: Templates — Layout Tanpa Data

**Files:**
- Create: `frontend/src/components/templates/DashboardTemplate/DashboardTemplate.tsx`
- Create: `frontend/src/components/templates/DashboardTemplate/index.ts`
- Create: `frontend/src/components/templates/PublicPortalTemplate/PublicPortalTemplate.tsx`
- Create: `frontend/src/components/templates/PublicPortalTemplate/index.ts`
- Create: `frontend/src/components/templates/WizardTemplate/WizardTemplate.tsx`
- Create: `frontend/src/components/templates/WizardTemplate/index.ts`
- Modify: `frontend/src/components/templates/index.ts`

**Interfaces:**
- Consumes: `Navbar`, `Footer` dari organisms
- Produces:
  - `DashboardTemplateProps { children: React.ReactNode; activePath: string; title?: string; }`
  - `PublicPortalTemplateProps { children: React.ReactNode; activePath: string; }`
  - `WizardTemplateProps { children: React.ReactNode; title: string; description?: string; }`
  - **Aturan:** Tidak ada `fetch()`, `useEffect`, atau React state di layer template. Template hanya mengatur layout spatial.

- [ ] **Step 1: Implementasikan `DashboardTemplate.tsx`**

  Struktur: `<Navbar activePath>` + `<main className="flex-1 ...">children</main>` + `<Footer>`.

- [ ] **Step 2: Implementasikan `PublicPortalTemplate.tsx`**

  Identik dengan DashboardTemplate, namun menampilkan banner informasi bahwa halaman ini dapat diakses tanpa login.

- [ ] **Step 3: Implementasikan `WizardTemplate.tsx`**

  Struktur: header dengan judul & deskripsi wizard + `<main>` slot konten tanpa Navbar (wizard full-focus). Tombol "× Batal" di pojok kanan.

- [ ] **Step 4: Update barrel `templates/index.ts`**

- [ ] **Step 5: Verifikasi TypeScript**

  Run: `npx tsc --noEmit`
  Expected: 0 error.

- [ ] **Step 6: Commit**

  ```bash
  git add frontend/src/components/templates/
  git commit -m "feat(frontend): implement layout templates (Dashboard, PublicPortal, Wizard)"
  ```

---

### Task 7: Pages — Integrasi App Router dengan Atomic Design

**Files:**
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/kontrak/baru/page.tsx`
- Create: `frontend/src/app/kontrak/[id]/page.tsx`
- Create: `frontend/src/app/transparansi/page.tsx`
- Create: `frontend/src/app/transparansi/[id]/page.tsx`
- Create: `frontend/src/app/lapor/page.tsx`

**Interfaces:**
- Consumes: Templates dari `@/components/templates`, Organisms dari `@/components/organisms`
- Produces:
  - Landing page SAKSI (hero, 7 alur kerja, CTA)
  - Halaman pembuatan kontrak dengan `QuestionnaireWizard`
  - Halaman detail kontrak dengan `ClauseEditor` dan `IntegrityPanel`
  - Portal publik dengan `ContractList` berfilter
  - Detail kontrak publik ter-redaksi
  - Halaman laporan warga

- [ ] **Step 1: Modifikasi `page.tsx` — Landing Page SAKSI**

  Gunakan `DashboardTemplate`. Tampilkan: hero section (nama platform, tagline), 7 alur kerja sebagai kartu, 3 CTA (`<Button>`) menuju `/kontrak/baru`, `/transparansi`, `/lapor`.

- [ ] **Step 2: Buat `kontrak/baru/page.tsx`**

  Gunakan `WizardTemplate`. Render `<QuestionnaireWizard onSubmit={...} />`. Handler `onSubmit` akan `fetch("/api/contracts", { method: "POST" })` ke backend; stub dengan `console.log` jika API belum siap.

- [ ] **Step 3: Buat `kontrak/[id]/page.tsx`**

  Gunakan `DashboardTemplate`. Fetch kontrak dari API atau stub data. Render `<ClauseEditor>` dan `<IntegrityPanel>`. Tombol "Tanda Tangani" jika status `AI_AUDITED`, disabled jika sudah `SIGNED`.

- [ ] **Step 4: Buat `transparansi/page.tsx`**

  Gunakan `PublicPortalTemplate`. Render `<ContractList contracts={stubContracts} />` dengan filter kategori.

- [ ] **Step 5: Buat `transparansi/[id]/page.tsx`**

  Gunakan `PublicPortalTemplate`. Tampilkan konten ter-redaksi dan `<IntegrityPanel>` mode read-only.

- [ ] **Step 6: Buat `lapor/page.tsx`**

  Gunakan `PublicPortalTemplate`. Render `<ReportForm contractId="" onSubmit={async () => console.log()} />`.

- [ ] **Step 7: Verifikasi end-to-end**

  Run: `npm run dev` di `frontend/`
  Expected: Semua route dapat diakses di browser tanpa runtime error.

  Run: `npm run build`
  Expected: Build sukses, 0 TypeScript error.

- [ ] **Step 8: Commit**

  ```bash
  git add frontend/src/app/
  git commit -m "feat(frontend): wire atomic design into Next.js App Router pages"
  ```

---

## Ringkasan Dependency Antar Task

```
Task 1 (Token) ──┐
                  ├──→ Task 3 (Atoms) → Task 4 (Molecules) → Task 5 (Organisms) → Task 6 (Templates) → Task 7 (Pages)
Task 2 (Types) ──┘
```

Tasks 1 dan 2 dapat dikerjakan **paralel**. Tasks 3–7 harus **sequential**.

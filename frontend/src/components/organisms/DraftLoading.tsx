/* Shown while the AI drafts the clauses and checks them */
export default function DraftLoading() {
  return (
    <div
      className="items-center flex gap-20 justify-center min-h-300 [&_p]:grid [&_p]:gap-4 [&_strong]:text-[1.8rem] [&_strong]:font-[400] [&_small]:text-[1.35rem] [&_small]:text-dim"
      role="status"
    >
      <span
        className="[animation:d-spin_0.9s_linear_infinite] border-[0.3rem] border-line border-solid rounded-[50%] border-t-blue h-44 w-44"
        aria-hidden="true"
      />
      <p>
        <strong>AI sedang menyusun draf dan memeriksa pasal…</strong>
        <small>
          Mencocokkan dengan aturan pengadaan desa dan contoh pasal.
        </small>
      </p>
    </div>
  );
}

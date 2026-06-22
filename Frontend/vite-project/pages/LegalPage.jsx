import { useNavigate } from "react-router-dom";

export default function LegalPage({ title, intro }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:bg-white/5"
        >
          Back to Home
        </button>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-white/40">
            CortexAI Legal
          </p>
          <h1 className="mt-4 text-4xl font-semibold">{title}</h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/68">{intro}</p>

          <div className="mt-10 space-y-8 text-white/72">
            <section>
              <h2 className="text-xl font-semibold text-white">Overview</h2>
              <p className="mt-3 leading-7">
                This page is a clean placeholder so your landing page footer has
                working navigation. You can replace this copy with your final
                legal text whenever you are ready.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">How to use it</h2>
              <p className="mt-3 leading-7">
                Keep the layout and update the wording with your actual legal
                content, clauses, contact details, and compliance notes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Contact</h2>
              <p className="mt-3 leading-7">
                Add your support email or company contact details here so users
                know where to reach you for policy-related questions.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

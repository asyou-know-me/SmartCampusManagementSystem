import {Link} from "react-router-dom";

const Submitted = () => {
  return (
    <body className="bg-[#10182a] text-on-surface min-h-screen flex flex-col items-center">
      <header className="w-full pt-8 px-8 bg-[#10182a]">
        <nav className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="text-white font-['Manrope'] font-bold text-xl">
            Editorial Serenity
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="material-symbols-outlined text-slate-400 hover:text-[#22C55E] transition-colors duration-300 active:opacity-80">
              close
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center w-full px-6 pt-24 pb-32">
        <section className="max-w-2xl w-full flex flex-col items-center text-center">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150"></div>
            <div className="relative w-32 h-32 flex items-center justify-center bg-primary rounded-full editorial-shadow group animate-check">
              <span
                className="material-symbols-outlined text-white text-6xl leading-none transition-transform duration-500 group-hover:scale-110"
                style="font-variation-settings: 'wght' 600;"
              >
                check
              </span>
            </div>
          </div>

          <div className="space-y-6 max-w-lg mx-auto">
            <h1 className="font-headline font-extrabold text-[3.5rem] leading-[1.1] tracking-tight text-white">
              Request Submitted
            </h1>
            <p className="font-body text-lg leading-[1.6] text-slate-300">
              Your request has been received and is currently being processed by
              our team. We've sent a detailed summary to your registered email.
            </p>
          </div>
          <div className="mt-16 w-full max-w-md bg-white/5 backdrop-blur-sm p-8 rounded-3xl space-y-8 editorial-shadow text-left border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">
                  description
                </span>
              </div>
              <div>
                <p className="font-label text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Status
                </p>
                <p className="font-body font-semibold text-white">
                  Processing Queue
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">
                  schedule
                </span>
              </div>
              <div>
                <p className="font-label text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Expected Update
                </p>
                <p className="font-body font-semibold text-white">
                  Within 24-48 hours
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 w-full max-w-xs">
            <Link to="/">
              <button className="w-full bg-[#22C55E] text-white py-5 px-8 rounded-3xl font-headline font-bold text-lg editorial-shadow transition-all duration-300 hover:brightness-110 hover:-translate-y-1 active:scale-95 active:opacity-90">
                Done
              </button>
            </Link>
          </div>

          <div className="absolute -bottom-10 -left-20 w-96 h-96 opacity-10 pointer-events-none">
            <img
              className="w-full h-full object-contain invert opacity-20"
              data-alt="abstract architectural forms with soft curves and clean lines in minimal white studio lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfbiDjA8d3YziKksE8QQydr_944RklSFwA8sOHDCPyqzSPKe1lM5g1nQM7ibtfvmfipMH6D8EiiAnCXMxfOs973EkLqy_KGCfF5JTA38sbUEUjYPHPRpDTsVhAktpWzvtFqrXrmjEF5UjpY7WROCG23Lg9aF8gvMEa45I_ZHkXTUwpwFwmmxic_I8nLO7kcLyflCkNHolFMmhkWucZt4I5C7HHw1dxTfFOYb0G2XYrQZbhr6VP7SWPxBhIY-eBd4eW2p7Pt02rsQM"
            />
          </div>
        </section>
      </main>
      <footer className="w-full py-12 px-8 flex justify-center border-t border-white/5">
        <p className="font-body text-sm text-slate-500">
          © 2024 Editorial Serenity. All rights reserved.
        </p>
      </footer>
    </body>
  );
};

export default Submitted;

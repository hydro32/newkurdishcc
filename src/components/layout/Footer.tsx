import Link from "next/link";

const links = [
  { href: "/", label: "سەرەکی" },
  { href: "/stories", label: "چیرۆکەکان" },
  { href: "/upload", label: "بڵاوکردنەوە" },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <h2 className="text-xl font-extrabold text-brand">
            کوردیش<span className="text-white">تیوب</span>
          </h2>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
        </p>
      </div>
    </footer>
  );
}

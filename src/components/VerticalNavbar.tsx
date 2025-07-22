const sections = [
  { id: "myinfo", label: "Home" },
  { id: "technologies", label: "Technologies" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export default function VerticalNavbar() {
  return (
    <nav className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-50">
      <ul className="space-y-4">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-white hover:text-blue-400 transition"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

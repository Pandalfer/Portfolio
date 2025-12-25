import VerticalNavbar from "@/components/VerticalNavbar";
import MyInfo from "@/components/MyInfo";
import Title from "@/components/Title";
import TechnologiesBlackHole from "@/components/Technologies/TechnologiesBlackHole";
import Projects from "@/components/Projects/Projects";
import AboutMe from "@/components/About/About Me";
import Contact from "@/components/Contact/Contact";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-dark overflow-x-hidden relative">
      <VerticalNavbar />

      <section id="myinfo">
        <MyInfo />
      </section>

      <div className="mt-10" />

      <Title text="Technologies and languages I use" />

      <section id="technologies">
        <TechnologiesBlackHole />
      </section>


      <Title text="Projects" />
      <div className="mt-10" />

      <section id="projects">
        <Projects />
      </section>

      <Title text="About Me" />
      <div className="mt-10" />

      <section id="about">
        <AboutMe />
      </section>

      <Title text="Contact" />
      <div className="mt-10" />

      <section id="contact">
        <Contact />
      </section>

      <div className="mt-10" />
    </div>
  );
}

import GithubPfp from "@/components/GithubPfp";

export default function MyInfo() {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-4xl mx-auto p-6 md:p-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start w-full gap-6">

        <div className="flex-shrink-0">
          <GithubPfp />
        </div>

        <div className="flex flex-col items-center sm:items-start flex-grow min-w-0">
          <h1 className="text-main-dark text-2xl font-bold">
            Shashish
          </h1>
          {/* mt-1 for mobile, sm:mt-4 pushes it down only on desktop */}
          <p className="text-body-dark mt-1 md:mt-4 flex items-center">
            <span className="mr-1">📍</span> United Kingdom
          </p>
        </div>

        <div className="flex flex-row gap-5 sm:ml-auto flex-shrink-0 sm:mt-2">
          <a
            href="mailto:Pandaking3005@proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img
              width={24}
              height={24}
              src="https://cdn.simpleicons.org/gmail/white"
              alt="Email"
              className="w-6 h-6 block"
            />
          </a>
          <a
            href="https://github.com/Pandalfer"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            <img
              width={24}
              height={24}
              src="https://cdn.simpleicons.org/github/white"
              alt="GitHub"
              className="w-6 h-6 block"
            />
          </a>
        </div>
      </div>

      <div className="w-full mt-8 border-t border-white/10 pt-6">
        <p className="italic text-body-dark text-center">
          Hi! I’m a 15 yr old developer building games and websites for fun
        </p>
      </div>
    </div>
  );
}
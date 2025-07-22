import GithubPfp from "@/components/GithubPfp";

export default function MyInfo() {
  return (
    <div className="flex flex-col justify-center items-center w-screen p-10">
      <div className={`flex flex-row`}>
        <GithubPfp />
        <div className={"flex flex-col "}>
          <p className={"text-main-dark font-bold ml-4 mt-5"}>Shashish Panda</p>
          <p className={"text-body-dark ml-3 mt-2"}>
            📍Hertfordshire, United Kingdom
          </p>
        </div>
        <div className={"flex flex-row mt-7 gap-4 ml-40"}>
          <a
            href="mailto:Pandaking3005@proton.me"
            target="_blank\"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={24}
              height={24}
              src="https://cdn.simpleicons.org/gmail/white"
              alt="GitHub"
              className="w-6 h-6"
            />
          </a>
          <a
            href="https://github.com/Pandalfer"
            target="_blank\"
            rel="noopener noreferrer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={24}
              height={24}
              src="https://cdn.simpleicons.org/github/white"
              alt="GitHub"
              className="w-6 h-6"
            />
          </a>
        </div>
      </div>
      <p className={"italic text-body-dark mt-8"}>
        Hi! I’m a 14 yr old developer building games and websites for fun
      </p>
    </div>
  );
}

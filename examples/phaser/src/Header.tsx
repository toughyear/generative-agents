import React from "react";
// import from react-icons
import { FaTwitter, FaGithub, FaDiscord } from "react-icons/fa";

const button = [
  { href: "https://twitter.com/toughyear", icon: <FaTwitter /> },
  {
    href: "https://github.com/toughyear/generative-agents",
    icon: <FaGithub />,
  },
  { href: "https://discord.com/invite/9NjpMXtVaW", icon: <FaDiscord /> },
];

function Header() {
  return (
    <section>
      <nav className='flex px-6 h-16 items-center justify-end gap-2'>
        <a
          href={"https://multimode.run/"}
          className='flex items-center mr-auto font-semibold tracking-wide'
        >
          Generative Agents Demo
        </a>
        {button.map(({ href, icon }) => {
          return (
            <a
              key={href}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:opacity-75 p-2'
            >
              {icon}
            </a>
          );
        })}
      </nav>
    </section>
  );
}

export default Header;

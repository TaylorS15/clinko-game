export default function Faq() {
  return (
    <div className="flex max-w-3xl flex-col gap-4 px-6 pb-20 text-seasalt">
      <p className="text-3xl font-bold">FAQ</p>
      <p className="text-2xl font-bold">
        What is Clinko?{' '}
        <span className="text-xl text-cyan-700">
          A simple game where you&apos;re mean&apos;t to mostly AFK and build up
          enough points to buy buildings and upgrades!
        </span>
      </p>

      <p className="text-2xl font-bold">
        How do Buildings and Upgrades work?{' '}
        <span className="text-xl text-cyan-700">
          <br></br>- Buildings have a set number of balls per second they drop
          and as you upgrade them the balls they drop are worth more!
          <br></br>- Buildings cost points to produce balls! A level 3 building
          costs 3 points to produce a ball.
          <br></br>- Clicking is always free and produces balls at the level of
          the Cursors building!
          <br></br>- As you increase the number of rows, the EV of each ball
          dropped increases!
        </span>
      </p>

      <p className="text-2xl font-bold">
        Why was Clinko made?{' '}
        <span className="text-xl text-cyan-700">
          Primarily for learning by building a complicated web app with the T3
          Stack consisting of Next.js, TailwindCSS, TypeScript, Prisma,
          NextAuth, tRPC, Zod, Vercel for web hosting, and PlanetScale for MySQL
          hosting.
        </span>
      </p>

      <p className="text-2xl font-bold">
        Who made Clinko?{' '}
        <span className="text-xl text-turquoise/60 hover:underline">
          <a
            href="https://taylorsvec.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            Taylor Svec
          </a>
        </span>
      </p>
    </div>
  );
}

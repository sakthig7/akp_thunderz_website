import React from 'react';
import { Target, Eye, Award, Users } from 'lucide-react';

const About = () => (
  <div className="mx-auto max-w-5xl px-4 py-14">
    <h1 className="section-title text-center">About AKP THUNDERz</h1>
    <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-400">
      A cricket club built on discipline, teamwork, and the relentless pursuit of excellence.
    </p>

    <div className="mt-12 grid gap-8 md:grid-cols-2">
      <div className="card">
        <h2 className="mb-2 flex items-center gap-2 font-display text-2xl text-gold"><Award size={22} /> Club History</h2>
        <p className="text-neutral-400">
          AKP THUNDERz was founded by a group of passionate cricketers determined to build a competitive,
          community-driven club. Since then, the team has grown from a handful of weekend players into a
          full-fledged club with a structured league presence, youth development, and a loyal fan base.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-2 flex items-center gap-2 font-display text-2xl text-gold"><Eye size={22} /> Vision</h2>
        <p className="text-neutral-400">
          To be recognized as one of the most respected and competitive cricket clubs in the region, known for
          sportsmanship, skill development, and community engagement.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-2 flex items-center gap-2 font-display text-2xl text-gold"><Target size={22} /> Mission</h2>
        <p className="text-neutral-400">
          To nurture cricketing talent at every level, foster a culture of hard work and camaraderie, and compete
          at the highest standard while giving back to the local cricket community.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-2 flex items-center gap-2 font-display text-2xl text-gold"><Users size={22} /> Club Management</h2>
        <p className="text-neutral-400">
          The club is run by a dedicated management committee overseeing operations, player development, finances,
          and event organization, working closely with the coaching staff and team captains.
        </p>
      </div>
    </div>

    <div className="mt-12 card">
      <h2 className="mb-4 font-display text-2xl text-gold">Achievements</h2>
      <ul className="grid gap-3 text-neutral-300 sm:grid-cols-2">
        <li className="flex items-center gap-2"><Award size={16} className="text-gold" /> Regional League Champions 2023</li>
        <li className="flex items-center gap-2"><Award size={16} className="text-gold" /> Runners-up, City T20 Cup 2022</li>
        <li className="flex items-center gap-2"><Award size={16} className="text-gold" /> Fair Play Award 2021</li>
        <li className="flex items-center gap-2"><Award size={16} className="text-gold" /> Best Emerging Club 2020</li>
      </ul>
    </div>
  </div>
);

export default About;

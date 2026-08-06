import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, Newspaper, Facebook, Instagram, Youtube, Twitter, MessageCircle } from 'lucide-react';
import { getMatches } from '../services/matchService';
import { getNews } from '../services/newsService';
import { getGallery } from '../services/galleryService';
import MatchCard from '../components/MatchCard';
import NewsCard from '../components/NewsCard';
import Spinner from '../components/Spinner';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [latestMatch, setLatestMatch] = useState(null);
  const [upcomingMatch, setUpcomingMatch] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [completedRes, upcomingRes, newsRes, galleryRes] = await Promise.all([
          getMatches({ status: 'Completed', limit: 1 }),
          getMatches({ status: 'Upcoming', limit: 1 }),
          getNews({ limit: 3 }),
          getGallery({ limit: 6 })
        ]);
        setLatestMatch(completedRes.data.data[0] || null);
        setUpcomingMatch(upcomingRes.data.data[0] || null);
        setNewsList(newsRes.data.data);
        setGalleryPreview(galleryRes.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { icon: Trophy, label: 'Matches Played', value: '150+' },
    { icon: Users, label: 'Active Players', value: '25+' },
    { icon: Calendar, label: 'Years Running', value: '8' },
    { icon: Newspaper, label: 'Tournaments Won', value: '12' }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-neutral-950 bg-stadium bg-cover bg-center text-center">
        <div className="relative z-10 px-4">
          <img src="/logo.png" alt="AKP THUNDERz" className="mx-auto mb-6 h-40 w-40 rounded-full ring-4 ring-gold object-cover" />
          <h1 className="font-display text-5xl md:text-7xl text-gold drop-shadow-lg">AKP THUNDERz</h1>
          <p className="mt-3 text-lg text-neutral-300">Play Hard &middot; Play Smart &middot; Play Together</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary">Join The Club</Link>
            <Link to="/matches" className="btn-secondary">View Matches</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-800 bg-neutral-900/50 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 text-gold" size={28} />
              <p className="font-display text-3xl text-white">{value}</p>
              <p className="text-sm text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {loading ? (
        <Spinner full />
      ) : (
        <>
          {/* Latest / Upcoming Match */}
          <section className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="section-title text-center">Match Center</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {upcomingMatch ? <MatchCard match={upcomingMatch} /> : <p className="text-neutral-500">No upcoming matches scheduled.</p>}
              {latestMatch ? <MatchCard match={latestMatch} /> : <p className="text-neutral-500">No completed matches yet.</p>}
            </div>
            <div className="mt-6 text-center">
              <Link to="/matches" className="btn-secondary">View All Matches</Link>
            </div>
          </section>

          {/* News */}
          {newsList.length > 0 && (
            <section className="border-t border-neutral-800 bg-neutral-900/40 py-14">
              <div className="mx-auto max-w-6xl px-4">
                <h2 className="section-title text-center">Latest News</h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {newsList.map((n) => <NewsCard key={n._id} article={n} />)}
                </div>
              </div>
            </section>
          )}

          {/* Gallery Preview */}
          {galleryPreview.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 py-14">
              <h2 className="section-title text-center">Gallery</h2>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {galleryPreview.map((g) => (
                  <div key={g._id} className="aspect-square overflow-hidden rounded-lg border border-neutral-800">
                    {g.type === 'video' ? (
                      <video src={g.url} className="h-full w-full object-cover" muted />
                    ) : (
                      <img src={g.url} alt={g.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link to="/gallery" className="btn-secondary">View Full Gallery</Link>
              </div>
            </section>
          )}
        </>
      )}

      {/* Sponsors */}
      <section className="border-t border-neutral-800 bg-neutral-900/40 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="section-title">Our Sponsors</h2>
          <p className="mt-2 text-neutral-400">Proud partners supporting AKP THUNDERz</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-70">
            {['Sponsor 1', 'Sponsor 2', 'Sponsor 3', 'Sponsor 4'].map((s) => (
              <div key={s} className="rounded-md border border-neutral-800 px-6 py-4 text-sm text-neutral-500">{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-maroon-dark to-maroon py-14 text-center">
        <h2 className="font-display text-3xl text-gold">Ready to be part of the Thunder?</h2>
        <p className="mt-2 text-neutral-200">Get in touch with the club or follow us on social media.</p>
        <div className="mt-6 flex justify-center gap-4">
          {[Facebook, Instagram, Youtube, Twitter, MessageCircle].map((Icon, i) => (
            <a key={i} href="#" className="rounded-full border border-gold p-3 text-gold transition hover:bg-gold hover:text-neutral-950">
              <Icon size={20} />
            </a>
          ))}
        </div>
        <Link to="/contact" className="btn-primary mt-8 inline-flex">Contact Us</Link>
      </section>
    </div>
  );
};

export default Home;

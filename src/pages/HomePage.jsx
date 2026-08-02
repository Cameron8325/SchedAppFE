import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import teaPouring from '../img/tea-pouring.jpg';
import teaRitual from '../img/tea-ritual.jpg';
import teaTogether from '../img/tea-together.jpg';

const SESSIONS = [
  {
    title: 'Tea Tasting',
    dayType: 'tea_tasting',
    image: teaTogether,
    imageClass: 'tea-session__image--portrait',
    description:
      'Taste several teas side by side. Learn where they come from, how they were made, and what changes from one infusion to the next.',
  },
  {
    title: 'Intro to Gongfu',
    dayType: 'intro_gongfu',
    image: teaRitual,
    description:
      'A hands-on first session with the vessels, water, timing, and repeat infusions that make Gong Fu Cha a practice rather than a recipe.',
  },
  {
    title: 'Tea and Meditation',
    dayType: 'guided_meditation',
    image: teaPouring,
    description:
      'A slower table. Guided attention, deliberate pours, and enough quiet to notice what a cup of tea can hold.',
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <main>
      <section className="tea-hero" aria-labelledby="tea-home-title">
        <img
          src={teaPouring}
          alt="Hot water being poured over a small clay teapot at a tea table."
          className="tea-hero__image"
        />
        <div className="tea-hero__shade" aria-hidden="true" />
        <div className="tea-hero__content">
          <p className="tea-kicker">Small-group tea sessions</p>
          <h1 id="tea-home-title" className="tea-hero__title">
            Make time<br />for the whole cup.
          </h1>
          <p className="tea-hero__lede">
            Gong Fu tea is brewed in small vessels and shared over many pours.
            Reserve one of four seats at the table and learn by tasting.
          </p>
          <div className="tea-hero__actions">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/appointments')}
            >
              Find a session
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/about')}
              sx={{
                color: '#FFFDF7',
                borderColor: 'rgba(255,253,247,.55)',
                '&:hover': { borderColor: '#FFFDF7', backgroundColor: 'rgba(255,255,255,.08)' },
              }}
            >
              About the practice
            </Button>
          </div>
          <p className="tea-hero__note">
            Four guests maximum<br />Reservation required<br />All experience levels welcome
          </p>
        </div>
      </section>

      <section className="tea-section tea-intro" aria-labelledby="tea-intro-title">
        <div>
          <p className="tea-kicker" style={{ color: '#B33A24' }}>At the table</p>
          <h2 id="tea-intro-title">Not a class from the back row.</h2>
        </div>
        <p>
          Every session stays intentionally small. You can ask questions, handle
          the teaware, compare infusions, and leave knowing how to continue at home.
        </p>
      </section>

      <section className="tea-section" aria-labelledby="sessions-title">
        <p className="tea-kicker" style={{ color: '#B33A24' }}>Choose your session</p>
        <h2 id="sessions-title" className="tea-session-heading">Three ways in.</h2>

        <div className="tea-session-list" style={{ marginTop: '3rem' }}>
          {SESSIONS.map((session, index) => (
            <article className="tea-session" key={session.dayType}>
              <span className="tea-session__number">0{index + 1}</span>
              <div className="tea-session__copy">
                <h3>{session.title}</h3>
                <p>{session.description}</p>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/appointments?dayType=${session.dayType}`)}
                  sx={{ px: 0, minHeight: 36 }}
                >
                  See available dates
                </Button>
              </div>
              <img
                src={session.image}
                alt=""
                className={`tea-session__image ${session.imageClass || ''}`}
                loading="lazy"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="tea-process" aria-labelledby="process-title">
        <div className="tea-process__inner">
          <p className="tea-kicker" style={{ color: '#E8866D' }}>A simple reservation</p>
          <h2 id="process-title" className="tea-session-heading">
            From open date to first pour.
          </h2>
          <div className="tea-process__grid">
            <div className="tea-process__step">
              <span>01</span>
              <h3>Choose a session</h3>
              <p>See only the dates with seats still available.</p>
            </div>
            <div className="tea-process__step">
              <span>02</span>
              <h3>Request your seat</h3>
              <p>Create an account once, then reserve directly from the calendar.</p>
            </div>
            <div className="tea-process__step">
              <span>03</span>
              <h3>Watch your inbox</h3>
              <p>The host reviews your request and sends confirmation by email.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;

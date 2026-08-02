import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import teaPouring from '../img/tea-pouring.jpg';
import teaRitual from '../img/tea-ritual.jpg';
import teaTogether from '../img/tea-together.jpg';

const sessions = [
  {
    title: 'Tea Tasting',
    dayType: 'tea_tasting',
    image: teaTogether,
    alt: 'Two guests tasting tea together at a low tea table.',
    meta: ['Up to 4 guests', 'Guided tasting'],
    description:
      'Compare a curated flight across several infusions. We talk through origin, processing, aroma, texture, and the small decisions that change what lands in the cup.',
  },
  {
    title: 'Intro to Gongfu',
    dayType: 'intro_gongfu',
    image: teaRitual,
    alt: 'Hands pouring tea from a lidded brewing cup into a glass pitcher.',
    meta: ['Hands-on', 'Beginner friendly'],
    description:
      'Learn the working rhythm of Gong Fu Cha. You will handle the core teaware, practice water and timing, and see why repeated short infusions reveal more than one long steep.',
  },
  {
    title: 'Tea and Meditation',
    dayType: 'guided_meditation',
    image: teaPouring,
    alt: 'Hot water being poured into a clay teapot.',
    meta: ['Quiet session', 'No experience needed'],
    description:
      'Settle into a guided practice built around warmth, aroma, and deliberate movement. The tea gives attention somewhere concrete to return to.',
  },
];

function CatalogPage() {
  const navigate = useNavigate();

  return (
    <main>
      <header className="tea-catalog-hero">
        <div>
          <p className="tea-kicker" style={{ color: '#B33A24' }}>The sessions</p>
          <h1 className="tea-session-heading">Come curious.<br />Leave practiced.</h1>
        </div>
        <p>
          Each format opens a different door into tea. Pick the experience that
          fits what you want to notice, learn, or slow down for.
        </p>
      </header>

      {sessions.map((session, index) => (
        <article className="tea-catalog-row" key={session.dayType}>
          <img src={session.image} alt={session.alt} className="tea-catalog-row__image" />
          <div>
            <p className="tea-kicker" style={{ color: '#B33A24' }}>Session 0{index + 1}</p>
            <h2>{session.title}</h2>
            <div className="tea-catalog-row__meta">
              {session.meta.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p>{session.description}</p>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/appointments?dayType=${session.dayType}`)}
              sx={{ mt: 1 }}
            >
              Find a date
            </Button>
          </div>
        </article>
      ))}
    </main>
  );
}

export default CatalogPage;

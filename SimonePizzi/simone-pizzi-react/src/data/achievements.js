/**
 * Dati achievement per il sistema gamification
 */
export const achievements = [
  {
    id: 'first-visit',
    title: 'Prima Visita',
    description: 'Benvenuto nel sito di Simone Pizzi!',
    points: 10,
    category: 'exploration',
    icon: '🌟'
  },
  {
    id: 'explorer',
    title: 'Esploratore',
    description: 'Hai visitato 5 pagine diverse',
    points: 25,
    target: 5,
    category: 'exploration',
    icon: '🗺️'
  },
  {
    id: 'reader',
    title: 'Lettore Avido',
    description: 'Hai letto 3 articoli completi',
    points: 50,
    target: 3,
    category: 'content',
    icon: '📚'
  },
  {
    id: 'software-explorer',
    title: 'Esploratore Software',
    description: 'Hai visitato tutte le sezioni software',
    points: 75,
    category: 'software',
    icon: '💻'
  },
  {
    id: 'game-lover',
    title: 'Amante dei Videogiochi',
    description: 'Hai esplorato la sezione videogiochi',
    points: 40,
    category: 'gaming',
    icon: '🎮'
  },
  {
    id: 'contact-maker',
    title: 'Contattatore',
    description: 'Hai visitato la pagina contatti',
    points: 30,
    category: 'social',
    icon: '📞'
  },
  {
    id: 'konami-master',
    title: 'Maestro Konami',
    description: 'Hai inserito il Konami Code!',
    points: 100,
    category: 'secret',
    icon: '🎯'
  },
  {
    id: 'scroll-master',
    title: 'Maestro dello Scroll',
    description: 'Hai fatto scroll per 1000px',
    points: 35,
    target: 1000,
    category: 'interaction',
    icon: '📜'
  },
  {
    id: 'click-counter',
    title: 'Click Counter',
    description: 'Hai cliccato 50 volte',
    points: 20,
    target: 50,
    category: 'interaction',
    icon: '🖱️'
  },
  {
    id: 'time-spent',
    title: 'Visitatore Fedele',
    description: 'Hai passato 5 minuti sul sito',
    points: 60,
    target: 300, // 5 minuti in secondi
    category: 'engagement',
    icon: '⏰'
  }
];

/**
 * Categorie achievement
 */
export const achievementCategories = {
  exploration: {
    name: 'Esplorazione',
    color: 'blue',
    icon: '🗺️'
  },
  content: {
    name: 'Contenuti',
    color: 'green',
    icon: '📚'
  },
  software: {
    name: 'Software',
    color: 'purple',
    icon: '💻'
  },
  gaming: {
    name: 'Gaming',
    color: 'orange',
    icon: '🎮'
  },
  social: {
    name: 'Social',
    color: 'pink',
    icon: '📞'
  },
  secret: {
    name: 'Segreti',
    color: 'yellow',
    icon: '🎯'
  },
  interaction: {
    name: 'Interazione',
    color: 'cyan',
    icon: '🖱️'
  },
  engagement: {
    name: 'Engagement',
    color: 'red',
    icon: '⏰'
  }
}; 
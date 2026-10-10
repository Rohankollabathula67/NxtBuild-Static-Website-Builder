const BLUEPRINTS = [
  {
    icon: '↗',
    label: 'Launch a brand',
    title: 'Conversion-first site',
    description: 'A focused homepage that makes a product, service, or idea feel unmistakable.',
    prompt: 'Create a striking conversion-first landing page for my new business. Include a clear hero, proof points, a feature narrative, testimonials, and a strong call to action. Make the design feel editorial, modern, and premium.',
  },
  {
    icon: '◈',
    label: 'Shape a product',
    title: 'Product concept',
    description: 'Turn an early idea into a polished product experience with a clear workflow.',
    prompt: 'Build a polished product MVP with a dashboard, an intuitive core workflow, thoughtful empty states, and realistic sample data. Focus on a distinctive visual system and a usable end-to-end experience.',
  },
  {
    icon: '✦',
    label: 'Simplify a workflow',
    title: 'Internal tool',
    description: 'Design a calm, useful workspace for a team process that currently lives in spreadsheets.',
    prompt: 'Create an internal workflow tool for a small team. Include an overview, actionable work queue, detail view, progress states, and useful filters. Make it feel fast, focused, and genuinely useful.',
  },
  {
    icon: '◎',
    label: 'Tell a story',
    title: 'Personal presence',
    description: 'Make a memorable portfolio or profile that puts the work and personality first.',
    prompt: 'Create an expressive personal portfolio with a memorable hero, selected work, an about section, and a contact call to action. Use elegant typography, responsive design, and subtle motion.',
  },
];

function BlueprintLaunchpad({ onLaunch, launching }) {
  return (
    <section className="blueprint-launchpad" aria-labelledby="launchpad-title">
      <div className="blueprint-orbit blueprint-orbit-one" />
      <div className="blueprint-orbit blueprint-orbit-two" />
      <div className="blueprint-launchpad-intro">
        <p className="blueprint-kicker">Creation studio</p>
        <h2 id="launchpad-title">Start with an ambition,<br />not a blank canvas.</h2>
        <p>
          Pick a direction and NxtBuild will create a first version you can steer, inspect, and export.
        </p>
      </div>
      <div className="blueprint-grid">
        {BLUEPRINTS.map((blueprint) => (
          <button
            className="blueprint-card"
            key={blueprint.title}
            onClick={() => onLaunch(blueprint)}
            disabled={launching}
          >
            <span className="blueprint-icon" aria-hidden="true">{blueprint.icon}</span>
            <span className="blueprint-label">{blueprint.label}</span>
            <strong>{blueprint.title}</strong>
            <span className="blueprint-description">{blueprint.description}</span>
            <span className="blueprint-action">Build this direction <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default BlueprintLaunchpad;

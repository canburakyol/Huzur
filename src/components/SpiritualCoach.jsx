import Assistant from './Assistant';

/**
 * Legacy alias kept for backward compatibility with the feature registry.
 * This keeps the old coach entry aligned with the maintained Assistant surface.
 */
const SpiritualCoach = (props) => {
  return <Assistant {...props} />;
};

export default SpiritualCoach;

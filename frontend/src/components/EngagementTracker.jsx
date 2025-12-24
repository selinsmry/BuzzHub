import { useEffect, useRef } from 'react';
import { trackCommunityEngagement } from '../api/recommendationApi';

function EngagementTracker({ communityId }) {
  const startTimeRef = useRef(Date.now());
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Set initial time when component mounts
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    // Cleanup function - called when component unmounts
    return () => {
      if (!hasTrackedRef.current && communityId) {
        const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        // Only track if user spent at least 5 seconds
        if (timeSpent >= 5) {
          hasTrackedRef.current = true;
          trackCommunityEngagement(communityId, timeSpent)
            .then(() => console.log(`Tracked ${timeSpent}s engagement for community ${communityId}`))
            .catch(err => console.error('Failed to track engagement:', err));
        }
      }
    };
  }, [communityId]);

  // This component doesn't render anything visual
  return null;
}

export default EngagementTracker;

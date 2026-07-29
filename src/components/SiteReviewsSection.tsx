import { getSiteReviews, createSiteReview } from '@/actions/site_reviews';
import { ReviewCarousel } from './ReviewCarousel';
import { getUser } from '@/lib/auth';

export async function SiteReviewsSection() {
  const reviews = await getSiteReviews();
  const user = await getUser();

  return (
    <ReviewCarousel 
      reviews={reviews as any} 
      isLoggedIn={!!user} 
      createReviewAction={createSiteReview}
    />
  );
}

export const ACTIVE_CAMPAIGNS_QUERY = `*[_type == "campaign" && active == true && startDate <= now() && endDate > now()] | order(priority asc) {
  _id,
  tag,
  title,
  description,
  image,
  discountPercent,
  ctaText,
  ctaLink,
  startDate,
  endDate,
  priority
}`;

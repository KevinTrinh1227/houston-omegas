export default function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "Omega Mansion",
    "description": "5,300 sq ft private event venue available for rent in Houston, TX. Parties, corporate events, weddings, baby showers, and more.",
    "url": "https://houstonomegas.com/rent",
    "email": "events@houstonomegas.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "3819 Reveille St",
      "addressLocality": "Houston",
      "addressRegion": "TX",
      "postalCode": "77087",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.6894,
      "longitude": -95.3141
    },
    "maximumAttendeeCapacity": 500,
    "image": "https://houstonomegas.com/images/mansion.jpeg"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

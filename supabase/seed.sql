-- ============================================================================
-- YARDOLA DEVELOPMENT SEED DATA -- NOT PRODUCTION DATA
--
-- This file populates a local/dev database with representative catalog
-- data (locations, categories, services, businesses, projects, guides)
-- so the schema and RLS policies can be exercised end to end.
--
-- Every business, project, professional, and photo below is FICTIONAL.
-- Photo URLs point at https://placehold.co (a placeholder-image service)
-- and are clearly not real project photography.
--
-- Deliberately NOT seeded here (they require real Supabase Auth users,
-- which this script does not create): profiles, project_plans, leads,
-- lead_matches, lead_events, saved_projects, business_claims,
-- subscriptions, transactions. All businesses below are left unclaimed
-- (owner_id is null) for the same reason.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Locations: Nevada / Las Vegas metro only (V1 market).
-- ----------------------------------------------------------------------------

insert into public.states (id, name, abbreviation, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Nevada', 'NV', 'nevada');

insert into public.metros (id, state_id, name, slug) values
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Las Vegas Metro Area', 'las-vegas-metro');

insert into public.cities (id, metro_id, name, slug) values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222222', 'Las Vegas', 'las-vegas'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'Henderson', 'henderson'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'North Las Vegas', 'north-las-vegas'),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'Boulder City', 'boulder-city');

insert into public.neighborhoods (city_id, name, slug)
select c.id, v.name, v.slug
from (values
  ('las-vegas', 'Summerlin', 'summerlin'),
  ('las-vegas', 'Enterprise', 'enterprise'),
  ('las-vegas', 'Spring Valley', 'spring-valley'),
  ('las-vegas', 'The Lakes', 'the-lakes'),
  ('henderson', 'Green Valley', 'green-valley'),
  ('henderson', 'Anthem', 'anthem')
) as v(city_slug, name, slug)
join public.cities c on c.slug = v.city_slug;

insert into public.zip_codes (city_id, neighborhood_id, code)
select c.id, n.id, v.code
from (values
  ('las-vegas', 'summerlin', '89135'),
  ('las-vegas', 'summerlin', '89144'),
  ('las-vegas', 'spring-valley', '89117'),
  ('las-vegas', 'enterprise', '89123'),
  ('las-vegas', null, '89109'),
  ('las-vegas', null, '89101'),
  ('henderson', 'green-valley', '89014'),
  ('henderson', 'anthem', '89052'),
  ('north-las-vegas', null, '89030'),
  ('boulder-city', null, '89005')
) as v(city_slug, neighborhood_slug, code)
join public.cities c on c.slug = v.city_slug
left join public.neighborhoods n on n.slug = v.neighborhood_slug and n.city_id = c.id;

-- ----------------------------------------------------------------------------
-- Taxonomy: categories, services, features, styles.
-- ----------------------------------------------------------------------------

insert into public.categories (name, slug, sort_order) values
  ('Pools', 'pools', 1),
  ('Landscaping', 'landscaping', 2),
  ('Artificial Turf', 'artificial-turf', 3),
  ('Patios & Pavers', 'patios-pavers', 4),
  ('Outdoor Kitchens', 'outdoor-kitchens', 5),
  ('Pergolas', 'pergolas', 6),
  ('Putting Greens', 'putting-greens', 7),
  ('Outdoor Living', 'outdoor-living', 8);

insert into public.services (category_id, name, slug, sort_order)
select c.id, v.name, v.slug, v.sort_order
from (values
  ('pools', 'New Pool Construction', 'new-pool-construction', 1),
  ('pools', 'Pool Remodeling', 'pool-remodeling', 2),
  ('pools', 'Pool Resurfacing', 'pool-resurfacing', 3),
  ('pools', 'Pool Deck Construction', 'pool-deck-construction', 4),
  ('landscaping', 'Landscape Design', 'landscape-design', 1),
  ('landscaping', 'Xeriscaping', 'xeriscaping', 2),
  ('landscaping', 'Irrigation Installation', 'irrigation-installation', 3),
  ('landscaping', 'Tree & Shrub Installation', 'tree-shrub-installation', 4),
  ('artificial-turf', 'Residential Turf Installation', 'residential-turf-installation', 1),
  ('artificial-turf', 'Pet Turf Installation', 'pet-turf-installation', 2),
  ('patios-pavers', 'Paver Patio Installation', 'paver-patio-installation', 1),
  ('patios-pavers', 'Concrete Patio Installation', 'concrete-patio-installation', 2),
  ('patios-pavers', 'Stamped Concrete', 'stamped-concrete', 3),
  ('outdoor-kitchens', 'Outdoor Kitchen Design & Build', 'outdoor-kitchen-design-build', 1),
  ('outdoor-kitchens', 'BBQ Island Installation', 'bbq-island-installation', 2),
  ('pergolas', 'Wood Pergola Construction', 'wood-pergola-construction', 1),
  ('pergolas', 'Aluminum Pergola Installation', 'aluminum-pergola-installation', 2),
  ('pergolas', 'Shade Structure Installation', 'shade-structure-installation', 3),
  ('putting-greens', 'Backyard Putting Green Installation', 'backyard-putting-green-installation', 1),
  ('putting-greens', 'Putting Green Design', 'putting-green-design', 2),
  ('outdoor-living', 'Outdoor Living Space Design', 'outdoor-living-space-design', 1),
  ('outdoor-living', 'Fire Feature Installation', 'fire-feature-installation', 2),
  ('outdoor-living', 'Outdoor Lighting Design', 'outdoor-lighting-design', 3)
) as v(category_slug, name, slug, sort_order)
join public.categories c on c.slug = v.category_slug;

insert into public.features (name, slug, sort_order) values
  ('Water Feature', 'water-feature', 1),
  ('Fire Feature', 'fire-feature', 2),
  ('Outdoor Kitchen', 'outdoor-kitchen', 3),
  ('Covered Patio', 'covered-patio', 4),
  ('Pergola', 'pergola', 5),
  ('Lighting', 'lighting', 6),
  ('Putting Green', 'putting-green', 7),
  ('Spa / Hot Tub', 'spa-hot-tub', 8),
  ('BBQ Island', 'bbq-island', 9);

insert into public.styles (name, slug, sort_order) values
  ('Modern', 'modern', 1),
  ('Mediterranean', 'mediterranean', 2),
  ('Desert / Xeriscape', 'desert-xeriscape', 3),
  ('Tropical', 'tropical', 4),
  ('Traditional', 'traditional', 5),
  ('Contemporary', 'contemporary', 6);

-- ----------------------------------------------------------------------------
-- Businesses (10), left unclaimed (owner_id null -- see header note).
-- ----------------------------------------------------------------------------

insert into public.businesses (
  name, slug, description, website, phone, email, address, city, state, zip,
  latitude, longitude, verification_status, status
) values
  ('Desert Oasis Pools & Spas', 'desert-oasis-pools-spas',
   'Custom pool construction and remodeling serving the Las Vegas valley.',
   'https://desertoasispools.example.com', '(702) 555-0101', 'hello@desertoasispools.example.com',
   '4820 W Sahara Ave', 'Las Vegas', 'NV', '89102', 36.1420, -115.2160, 'verified', 'active'),
  ('Silver State Landscaping', 'silver-state-landscaping',
   'Full-service landscape design and installation for Southern Nevada homes.',
   'https://silverstatelandscaping.example.com', '(702) 555-0102', 'info@silverstatelandscaping.example.com',
   '7220 Bermuda Rd', 'Las Vegas', 'NV', '89119', 36.0580, -115.1730, 'verified', 'active'),
  ('Vegas Turf Co.', 'vegas-turf-co',
   'Artificial turf and putting green specialists for desert climates.',
   'https://vegasturfco.example.com', '(702) 555-0103', 'sales@vegasturfco.example.com',
   '10 Sunset Way', 'Henderson', 'NV', '89014', 36.0395, -115.0350, 'unverified', 'active'),
  ('Red Rock Outdoor Living', 'red-rock-outdoor-living',
   'Outdoor living spaces, kitchens, and fire features built for entertaining.',
   'https://redrockoutdoorliving.example.com', '(702) 555-0104', 'contact@redrockoutdoorliving.example.com',
   '2200 Paseo Verde Pkwy', 'Las Vegas', 'NV', '89135', 36.1660, -115.3350, 'verified', 'active'),
  ('Sunset Patio & Pavers', 'sunset-patio-pavers',
   'Paver patios, driveways, and stamped concrete throughout the valley.',
   'https://sunsetpatiopavers.example.com', '(702) 555-0105', 'quotes@sunsetpatiopavers.example.com',
   '891 Coronado Center Dr', 'Henderson', 'NV', '89052', 36.0080, -115.0700, 'pending', 'active'),
  ('Mojave Outdoor Kitchens', 'mojave-outdoor-kitchens',
   'Custom outdoor kitchens and BBQ islands, designed and built in-house.',
   'https://mojaveoutdoorkitchens.example.com', '(702) 555-0106', 'design@mojaveoutdoorkitchens.example.com',
   '3650 S Decatur Blvd', 'Las Vegas', 'NV', '89103', 36.1210, -115.2210, 'unverified', 'pending'),
  ('Henderson Pergola Works', 'henderson-pergola-works',
   'Wood and aluminum pergolas, shade structures, and covered patios.',
   'https://hendersonpergolaworks.example.com', '(702) 555-0107', 'hello@hendersonpergolaworks.example.com',
   '1130 Wigwam Pkwy', 'Henderson', 'NV', '89074', 36.0170, -115.0790, 'verified', 'active'),
  ('Green Valley Putting Greens', 'green-valley-putting-greens',
   'Synthetic putting greens engineered for the backyard golfer.',
   'https://greenvalleyputtinggreens.example.com', '(702) 555-0108', 'info@greenvalleyputtinggreens.example.com',
   '2920 St Rose Pkwy', 'Henderson', 'NV', '89052', 35.9980, -115.1200, 'unverified', 'active'),
  ('Summerlin Backyard Design', 'summerlin-backyard-design',
   'Full backyard transformations, from concept through construction.',
   'https://summerlinbackyarddesign.example.com', '(702) 555-0109', 'studio@summerlinbackyarddesign.example.com',
   '1980 Festival Plaza Dr', 'Las Vegas', 'NV', '89135', 36.1700, -115.3390, 'verified', 'active'),
  ('Boulder Creek Pools', 'boulder-creek-pools',
   'Pool construction and resurfacing serving Boulder City and Henderson.',
   'https://bouldercreekpools.example.com', '(702) 555-0110', 'office@bouldercreekpools.example.com',
   '500 Nevada Way', 'Boulder City', 'NV', '89005', 35.9780, -114.8340, 'unverified', 'active');

insert into public.business_profiles (business_id, tagline, about, year_established)
select b.id, v.tagline, v.about, v.year_established
from (values
  ('desert-oasis-pools-spas', 'Custom pools built for the desert.', 'Desert Oasis Pools & Spas has designed and built backyard pools across the Las Vegas valley for over a decade, from freeform lagoon pools to modern geometric designs.', 2011),
  ('silver-state-landscaping', 'Landscapes that thrive in the valley.', 'Silver State Landscaping specializes in water-wise, desert-appropriate landscape design that still feels lush and inviting.', 2008),
  ('vegas-turf-co', 'Green all year, no water bill.', 'Vegas Turf Co. installs premium synthetic turf and putting greens engineered to handle Southern Nevada heat.', 2015),
  ('red-rock-outdoor-living', 'Your backyard, built for entertaining.', 'Red Rock Outdoor Living designs complete outdoor living spaces -- kitchens, fire features, and shade -- as one cohesive project.', 2013),
  ('sunset-patio-pavers', 'Hardscape done right.', 'Sunset Patio & Pavers has laid thousands of square feet of paver patios and driveways across Henderson and Las Vegas.', 2016),
  ('mojave-outdoor-kitchens', 'Built-in kitchens, built to last.', 'Mojave Outdoor Kitchens designs and builds custom outdoor kitchens tailored to how you actually cook and entertain.', 2019),
  ('henderson-pergola-works', 'Shade, styled.', 'Henderson Pergola Works builds custom wood and aluminum pergolas and shade structures for Henderson-area backyards.', 2017),
  ('green-valley-putting-greens', 'Practice your short game at home.', 'Green Valley Putting Greens designs and installs synthetic greens for golfers who want to practice without leaving the yard.', 2018),
  ('summerlin-backyard-design', 'Full backyard transformations.', 'Summerlin Backyard Design manages complete backyard projects end to end, from initial concept through final walkthrough.', 2012),
  ('boulder-creek-pools', 'Pools for the whole valley.', 'Boulder Creek Pools serves Boulder City and Henderson with new pool construction and resurfacing.', 2009)
) as v(business_slug, tagline, about, year_established)
join public.businesses b on b.slug = v.business_slug;

insert into public.professionals (business_id, name, title, bio, sort_order)
select b.id, v.name, v.title, v.bio, v.sort_order
from (values
  ('desert-oasis-pools-spas', 'Marco Delgado', 'Founder & Lead Designer', 'Marco has designed pools across the Las Vegas valley for over 15 years.', 1),
  ('desert-oasis-pools-spas', 'Priya Nair', 'Project Manager', 'Priya keeps every Desert Oasis build on schedule from permitting to final fill.', 2),
  ('silver-state-landscaping', 'Tom Whitfield', 'Owner', 'Tom founded Silver State Landscaping after a decade in commercial landscape management.', 1),
  ('vegas-turf-co', 'Dana Reyes', 'Owner', 'Dana started Vegas Turf Co. to bring low-water, high-durability turf to Henderson.', 1),
  ('red-rock-outdoor-living', 'James Okafor', 'Lead Designer', 'James specializes in translating a homeowner''s entertaining style into a finished space.', 1),
  ('sunset-patio-pavers', 'Luis Fernandez', 'Owner', 'Luis has laid paver hardscape throughout Henderson since 2016.', 1),
  ('mojave-outdoor-kitchens', 'Sarah Kim', 'Founder', 'Sarah trained as a chef before founding Mojave Outdoor Kitchens.', 1),
  ('henderson-pergola-works', 'Bill Anderson', 'Owner', 'Bill has been building custom pergolas and shade structures since 2017.', 1),
  ('green-valley-putting-greens', 'Chris Palmer', 'Owner', 'Chris is a former golf course groundskeeper turned putting green installer.', 1),
  ('summerlin-backyard-design', 'Elena Ruiz', 'Principal Designer', 'Elena leads full backyard transformations from concept through construction.', 1),
  ('boulder-creek-pools', 'Mike Sorensen', 'Owner', 'Mike has built and resurfaced pools throughout Boulder City and Henderson.', 1)
) as v(business_slug, name, title, bio, sort_order)
join public.businesses b on b.slug = v.business_slug;

insert into public.business_services (business_id, service_id)
select b.id, s.id
from (values
  ('desert-oasis-pools-spas', 'new-pool-construction'),
  ('desert-oasis-pools-spas', 'pool-remodeling'),
  ('desert-oasis-pools-spas', 'pool-resurfacing'),
  ('desert-oasis-pools-spas', 'pool-deck-construction'),
  ('silver-state-landscaping', 'landscape-design'),
  ('silver-state-landscaping', 'xeriscaping'),
  ('silver-state-landscaping', 'irrigation-installation'),
  ('vegas-turf-co', 'residential-turf-installation'),
  ('vegas-turf-co', 'pet-turf-installation'),
  ('vegas-turf-co', 'backyard-putting-green-installation'),
  ('red-rock-outdoor-living', 'outdoor-living-space-design'),
  ('red-rock-outdoor-living', 'fire-feature-installation'),
  ('red-rock-outdoor-living', 'outdoor-lighting-design'),
  ('sunset-patio-pavers', 'paver-patio-installation'),
  ('sunset-patio-pavers', 'concrete-patio-installation'),
  ('sunset-patio-pavers', 'stamped-concrete'),
  ('mojave-outdoor-kitchens', 'outdoor-kitchen-design-build'),
  ('mojave-outdoor-kitchens', 'bbq-island-installation'),
  ('henderson-pergola-works', 'wood-pergola-construction'),
  ('henderson-pergola-works', 'aluminum-pergola-installation'),
  ('henderson-pergola-works', 'shade-structure-installation'),
  ('green-valley-putting-greens', 'backyard-putting-green-installation'),
  ('green-valley-putting-greens', 'putting-green-design'),
  ('summerlin-backyard-design', 'outdoor-living-space-design'),
  ('summerlin-backyard-design', 'landscape-design'),
  ('summerlin-backyard-design', 'paver-patio-installation'),
  ('boulder-creek-pools', 'new-pool-construction'),
  ('boulder-creek-pools', 'pool-resurfacing')
) as v(business_slug, service_slug)
join public.businesses b on b.slug = v.business_slug
join public.services s on s.slug = v.service_slug;

insert into public.business_service_areas (business_id, city_id)
select b.id, c.id
from (values
  ('desert-oasis-pools-spas', 'las-vegas'), ('desert-oasis-pools-spas', 'henderson'),
  ('silver-state-landscaping', 'las-vegas'), ('silver-state-landscaping', 'north-las-vegas'),
  ('vegas-turf-co', 'henderson'), ('vegas-turf-co', 'las-vegas'),
  ('red-rock-outdoor-living', 'las-vegas'), ('red-rock-outdoor-living', 'henderson'),
  ('sunset-patio-pavers', 'henderson'), ('sunset-patio-pavers', 'las-vegas'),
  ('mojave-outdoor-kitchens', 'las-vegas'),
  ('henderson-pergola-works', 'henderson'),
  ('green-valley-putting-greens', 'henderson'), ('green-valley-putting-greens', 'boulder-city'),
  ('summerlin-backyard-design', 'las-vegas'),
  ('boulder-creek-pools', 'boulder-city'), ('boulder-creek-pools', 'henderson')
) as v(business_slug, city_slug)
join public.businesses b on b.slug = v.business_slug
join public.cities c on c.slug = v.city_slug;

-- ----------------------------------------------------------------------------
-- Projects (30) -- 3 per business.
-- ----------------------------------------------------------------------------

insert into public.projects (
  business_id, title, slug, description, city_id, project_year, budget_range,
  property_type, status, is_featured
)
select b.id, v.title, v.slug, v.description, c.id, v.project_year,
       v.budget_range::public.budget_range, v.property_type::public.property_type,
       v.status::public.project_status, v.is_featured
from (values
  ('desert-oasis-pools-spas', 'Summerlin Lagoon Pool', 'summerlin-lagoon-pool', 'A freeform lagoon-style pool with a rock waterfall and tanning ledge.', 'las-vegas', 2023, '100k_250k', 'single_family', 'published', true),
  ('desert-oasis-pools-spas', 'Enterprise Modern Pool Remodel', 'enterprise-modern-pool-remodel', 'Full resurfacing and modern deck rebuild for a 1990s pool.', 'las-vegas', 2024, '50k_100k', 'single_family', 'published', false),
  ('desert-oasis-pools-spas', 'Henderson Family Pool & Spa', 'henderson-family-pool-spa', 'New pool and attached spa designed for a family with young kids.', 'henderson', 2022, '50k_100k', 'single_family', 'published', false),

  ('silver-state-landscaping', 'Spring Valley Xeriscape Refresh', 'spring-valley-xeriscape-refresh', 'Full front and backyard xeriscape conversion, cutting water use in half.', 'las-vegas', 2024, '10k_25k', 'single_family', 'published', true),
  ('silver-state-landscaping', 'North Las Vegas Desert Garden', 'north-las-vegas-desert-garden', 'Native desert planting with a new drip irrigation system.', 'north-las-vegas', 2023, '10k_25k', 'single_family', 'published', false),
  ('silver-state-landscaping', 'Las Vegas Backyard Softscape', 'las-vegas-backyard-softscape', 'Tree, shrub, and groundcover installation around a new patio.', 'las-vegas', 2024, 'under_10k', 'single_family', 'draft', false),

  ('vegas-turf-co', 'Green Valley Pet-Friendly Turf Yard', 'green-valley-pet-friendly-turf-yard', 'Durable pet turf with built-in drainage for two large dogs.', 'henderson', 2024, 'under_10k', 'single_family', 'published', false),
  ('vegas-turf-co', 'Anthem Turf & Putting Green Combo', 'anthem-turf-putting-green-combo', 'Full backyard turf conversion with an integrated putting green.', 'henderson', 2023, '10k_25k', 'single_family', 'published', true),
  ('vegas-turf-co', 'Summerlin Low-Maintenance Turf Yard', 'summerlin-low-maintenance-turf-yard', 'Turf replacement for a high-traffic backyard.', 'las-vegas', 2024, 'under_10k', 'single_family', 'published', false),

  ('red-rock-outdoor-living', 'Summerlin Outdoor Living Suite', 'summerlin-outdoor-living-suite', 'Covered patio, fire pit, and built-in seating for year-round entertaining.', 'las-vegas', 2023, '50k_100k', 'single_family', 'published', true),
  ('red-rock-outdoor-living', 'Henderson Fire Pit & Lounge', 'henderson-fire-pit-lounge', 'Custom fire pit and lounge area with string lighting.', 'henderson', 2024, '10k_25k', 'single_family', 'published', false),
  ('red-rock-outdoor-living', 'Las Vegas Shaded Dining Patio', 'las-vegas-shaded-dining-patio', 'A shaded outdoor dining area with market lighting.', 'las-vegas', 2022, '10k_25k', 'single_family', 'published', false),

  ('sunset-patio-pavers', 'Henderson Paver Patio & Walkway', 'henderson-paver-patio-walkway', 'Travertine paver patio with a matching front walkway.', 'henderson', 2024, '10k_25k', 'single_family', 'published', false),
  ('sunset-patio-pavers', 'Green Valley Stamped Concrete Patio', 'green-valley-stamped-concrete-patio', 'Stamped concrete patio replacing a cracked slab.', 'henderson', 2023, 'under_10k', 'single_family', 'published', false),
  ('sunset-patio-pavers', 'Las Vegas Paver Driveway & Patio', 'las-vegas-paver-driveway-patio', 'Combined driveway and backyard paver project.', 'las-vegas', 2024, '25k_50k', 'single_family', 'published', true),

  ('mojave-outdoor-kitchens', 'Las Vegas Chef''s Outdoor Kitchen', 'las-vegas-chefs-outdoor-kitchen', 'Full outdoor kitchen with grill, pizza oven, and bar seating.', 'las-vegas', 2023, '25k_50k', 'single_family', 'published', true),
  ('mojave-outdoor-kitchens', 'Spring Valley BBQ Island', 'spring-valley-bbq-island', 'Compact BBQ island built into an existing patio.', 'las-vegas', 2024, '10k_25k', 'single_family', 'draft', false),
  ('mojave-outdoor-kitchens', 'Henderson Outdoor Kitchen & Bar', 'henderson-outdoor-kitchen-bar', 'Outdoor kitchen and bar seating for entertaining.', 'henderson', 2022, '25k_50k', 'single_family', 'published', false),

  ('henderson-pergola-works', 'Green Valley Wood Pergola', 'green-valley-wood-pergola', 'Custom cedar pergola over an existing patio.', 'henderson', 2024, 'under_10k', 'single_family', 'published', false),
  ('henderson-pergola-works', 'Anthem Aluminum Louvered Pergola', 'anthem-aluminum-louvered-pergola', 'Motorized louvered aluminum pergola for adjustable shade.', 'henderson', 2023, '10k_25k', 'single_family', 'published', true),
  ('henderson-pergola-works', 'Henderson Shade Sail Patio', 'henderson-shade-sail-patio', 'Shade sail structure over a pool-adjacent patio.', 'henderson', 2024, 'under_10k', 'single_family', 'published', false),

  ('green-valley-putting-greens', 'Green Valley Backyard Putting Green', 'green-valley-backyard-putting-green', 'Multi-hole synthetic putting green with two-tier break.', 'henderson', 2023, '10k_25k', 'single_family', 'published', true),
  ('green-valley-putting-greens', 'Boulder City Chipping & Putting Green', 'boulder-city-chipping-putting-green', 'Combined chipping and putting green for short-game practice.', 'boulder-city', 2024, '10k_25k', 'single_family', 'published', false),
  ('green-valley-putting-greens', 'Anthem Compact Putting Green', 'anthem-compact-putting-green', 'Small-footprint putting green for a side yard.', 'henderson', 2024, 'under_10k', 'single_family', 'published', false),

  ('summerlin-backyard-design', 'Summerlin Full Backyard Transformation', 'summerlin-full-backyard-transformation', 'Complete backyard rebuild: pool, kitchen, turf, and pergola.', 'las-vegas', 2023, 'over_250k', 'single_family', 'published', true),
  ('summerlin-backyard-design', 'Las Vegas Mediterranean Courtyard', 'las-vegas-mediterranean-courtyard', 'Mediterranean-style courtyard with a fountain and paver patio.', 'las-vegas', 2024, '50k_100k', 'single_family', 'published', false),
  ('summerlin-backyard-design', 'Summerlin Modern Entertainer''s Yard', 'summerlin-modern-entertainers-yard', 'Modern entertainer''s backyard with turf, fire feature, and lighting.', 'las-vegas', 2022, '100k_250k', 'single_family', 'published', false),

  ('boulder-creek-pools', 'Boulder City Classic Pool Build', 'boulder-city-classic-pool-build', 'Traditional rectangular pool with a paver surround.', 'boulder-city', 2023, '50k_100k', 'single_family', 'published', true),
  ('boulder-creek-pools', 'Henderson Pool Resurfacing', 'henderson-pool-resurfacing', 'Pebble-finish resurfacing for an aging pool shell.', 'henderson', 2024, '10k_25k', 'single_family', 'published', false),
  ('boulder-creek-pools', 'Boulder City Pool & Spa Combo', 'boulder-city-pool-spa-combo', 'New pool and raised spa with a paver deck.', 'boulder-city', 2024, '50k_100k', 'single_family', 'draft', false)
) as v(business_slug, title, slug, description, city_slug, project_year, budget_range, property_type, status, is_featured)
join public.businesses b on b.slug = v.business_slug
join public.cities c on c.slug = v.city_slug;

-- Project categories (each project tagged with its business's primary category).
insert into public.project_categories (project_id, category_id)
select p.id, c.id
from (values
  ('summerlin-lagoon-pool', 'pools'), ('enterprise-modern-pool-remodel', 'pools'), ('henderson-family-pool-spa', 'pools'),
  ('spring-valley-xeriscape-refresh', 'landscaping'), ('north-las-vegas-desert-garden', 'landscaping'), ('las-vegas-backyard-softscape', 'landscaping'),
  ('green-valley-pet-friendly-turf-yard', 'artificial-turf'), ('anthem-turf-putting-green-combo', 'artificial-turf'), ('anthem-turf-putting-green-combo', 'putting-greens'), ('summerlin-low-maintenance-turf-yard', 'artificial-turf'),
  ('summerlin-outdoor-living-suite', 'outdoor-living'), ('henderson-fire-pit-lounge', 'outdoor-living'), ('las-vegas-shaded-dining-patio', 'outdoor-living'),
  ('henderson-paver-patio-walkway', 'patios-pavers'), ('green-valley-stamped-concrete-patio', 'patios-pavers'), ('las-vegas-paver-driveway-patio', 'patios-pavers'),
  ('las-vegas-chefs-outdoor-kitchen', 'outdoor-kitchens'), ('spring-valley-bbq-island', 'outdoor-kitchens'), ('henderson-outdoor-kitchen-bar', 'outdoor-kitchens'),
  ('green-valley-wood-pergola', 'pergolas'), ('anthem-aluminum-louvered-pergola', 'pergolas'), ('henderson-shade-sail-patio', 'pergolas'),
  ('green-valley-backyard-putting-green', 'putting-greens'), ('boulder-city-chipping-putting-green', 'putting-greens'), ('anthem-compact-putting-green', 'putting-greens'),
  ('summerlin-full-backyard-transformation', 'outdoor-living'), ('summerlin-full-backyard-transformation', 'pools'), ('las-vegas-mediterranean-courtyard', 'landscaping'), ('summerlin-modern-entertainers-yard', 'outdoor-living'),
  ('boulder-city-classic-pool-build', 'pools'), ('henderson-pool-resurfacing', 'pools'), ('boulder-city-pool-spa-combo', 'pools')
) as v(project_slug, category_slug)
join public.projects p on p.slug = v.project_slug
join public.categories c on c.slug = v.category_slug;

-- Project styles.
insert into public.project_styles (project_id, style_id)
select p.id, s.id
from (values
  ('summerlin-lagoon-pool', 'tropical'), ('enterprise-modern-pool-remodel', 'modern'), ('henderson-family-pool-spa', 'contemporary'),
  ('spring-valley-xeriscape-refresh', 'desert-xeriscape'), ('north-las-vegas-desert-garden', 'desert-xeriscape'), ('las-vegas-backyard-softscape', 'traditional'),
  ('green-valley-pet-friendly-turf-yard', 'contemporary'), ('anthem-turf-putting-green-combo', 'modern'), ('summerlin-low-maintenance-turf-yard', 'contemporary'),
  ('summerlin-outdoor-living-suite', 'modern'), ('henderson-fire-pit-lounge', 'contemporary'), ('las-vegas-shaded-dining-patio', 'traditional'),
  ('henderson-paver-patio-walkway', 'traditional'), ('green-valley-stamped-concrete-patio', 'contemporary'), ('las-vegas-paver-driveway-patio', 'modern'),
  ('las-vegas-chefs-outdoor-kitchen', 'modern'), ('spring-valley-bbq-island', 'contemporary'), ('henderson-outdoor-kitchen-bar', 'mediterranean'),
  ('green-valley-wood-pergola', 'traditional'), ('anthem-aluminum-louvered-pergola', 'modern'), ('henderson-shade-sail-patio', 'contemporary'),
  ('green-valley-backyard-putting-green', 'contemporary'), ('boulder-city-chipping-putting-green', 'traditional'), ('anthem-compact-putting-green', 'contemporary'),
  ('summerlin-full-backyard-transformation', 'modern'), ('las-vegas-mediterranean-courtyard', 'mediterranean'), ('summerlin-modern-entertainers-yard', 'modern'),
  ('boulder-city-classic-pool-build', 'traditional'), ('henderson-pool-resurfacing', 'contemporary'), ('boulder-city-pool-spa-combo', 'mediterranean')
) as v(project_slug, style_slug)
join public.projects p on p.slug = v.project_slug
join public.styles s on s.slug = v.style_slug;

-- Project features.
insert into public.project_features (project_id, feature_id)
select p.id, f.id
from (values
  ('summerlin-lagoon-pool', 'water-feature'), ('summerlin-lagoon-pool', 'lighting'),
  ('enterprise-modern-pool-remodel', 'lighting'),
  ('henderson-family-pool-spa', 'spa-hot-tub'),
  ('anthem-turf-putting-green-combo', 'putting-green'),
  ('summerlin-outdoor-living-suite', 'fire-feature'), ('summerlin-outdoor-living-suite', 'covered-patio'), ('summerlin-outdoor-living-suite', 'lighting'),
  ('henderson-fire-pit-lounge', 'fire-feature'), ('henderson-fire-pit-lounge', 'lighting'),
  ('las-vegas-shaded-dining-patio', 'covered-patio'), ('las-vegas-shaded-dining-patio', 'lighting'),
  ('las-vegas-chefs-outdoor-kitchen', 'outdoor-kitchen'), ('las-vegas-chefs-outdoor-kitchen', 'bbq-island'),
  ('spring-valley-bbq-island', 'bbq-island'),
  ('henderson-outdoor-kitchen-bar', 'outdoor-kitchen'), ('henderson-outdoor-kitchen-bar', 'bbq-island'),
  ('green-valley-wood-pergola', 'pergola'),
  ('anthem-aluminum-louvered-pergola', 'pergola'), ('anthem-aluminum-louvered-pergola', 'lighting'),
  ('henderson-shade-sail-patio', 'covered-patio'),
  ('green-valley-backyard-putting-green', 'putting-green'),
  ('boulder-city-chipping-putting-green', 'putting-green'),
  ('anthem-compact-putting-green', 'putting-green'),
  ('summerlin-full-backyard-transformation', 'water-feature'), ('summerlin-full-backyard-transformation', 'outdoor-kitchen'),
  ('summerlin-full-backyard-transformation', 'fire-feature'), ('summerlin-full-backyard-transformation', 'pergola'),
  ('las-vegas-mediterranean-courtyard', 'water-feature'), ('las-vegas-mediterranean-courtyard', 'lighting'),
  ('summerlin-modern-entertainers-yard', 'fire-feature'), ('summerlin-modern-entertainers-yard', 'lighting'),
  ('boulder-city-pool-spa-combo', 'spa-hot-tub')
) as v(project_slug, feature_slug)
join public.projects p on p.slug = v.project_slug
join public.features f on f.slug = v.feature_slug;

-- Project photos: one hero + two gallery photos per project (placeholder images).
insert into public.project_photos (project_id, url, alt_text, photo_type, sort_order)
select p.id,
       'https://placehold.co/1200x900?text=' || replace(v.suffix, ' ', '+'),
       p.title || ' -- ' || v.suffix,
       v.photo_type::public.photo_type,
       v.sort_order
from public.projects p
join lateral (
  values
    ('Yardola+Seed+Photo+1', 'hero', 0),
    ('Yardola+Seed+Photo+2', 'gallery', 1),
    ('Yardola+Seed+Photo+3', 'gallery', 2)
) as v(suffix, photo_type, sort_order) on true;

-- ----------------------------------------------------------------------------
-- Guides
-- ----------------------------------------------------------------------------

insert into public.guides (title, slug, excerpt, content, category_id, status, published_at)
select v.title, v.slug, v.excerpt, v.content, c.id, 'published'::public.guide_status, now() - (v.days_ago || ' days')::interval
from (values
  ('How to Plan a Pool Remodel in Las Vegas', 'how-to-plan-a-pool-remodel-in-las-vegas',
   'What to consider before resurfacing or remodeling an aging Las Vegas pool.',
   '# How to Plan a Pool Remodel in Las Vegas' || chr(10) || chr(10) || 'This is placeholder guide content for local development. Replace with real editorial content before launch.',
   'pools', 30),
  ('Choosing the Right Artificial Turf for Nevada''s Climate', 'choosing-artificial-turf-for-nevadas-climate',
   'Not all turf is built for 115-degree summers -- here''s what to look for.',
   '# Choosing the Right Artificial Turf for Nevada''s Climate' || chr(10) || chr(10) || 'This is placeholder guide content for local development. Replace with real editorial content before launch.',
   'artificial-turf', 21),
  ('Budgeting for an Outdoor Kitchen', 'budgeting-for-an-outdoor-kitchen',
   'A realistic look at what outdoor kitchens cost in the Las Vegas valley.',
   '# Budgeting for an Outdoor Kitchen' || chr(10) || chr(10) || 'This is placeholder guide content for local development. Replace with real editorial content before launch.',
   'outdoor-kitchens', 14),
  ('Desert Landscaping 101', 'desert-landscaping-101',
   'The basics of xeriscaping and water-wise landscape design in Southern Nevada.',
   '# Desert Landscaping 101' || chr(10) || chr(10) || 'This is placeholder guide content for local development. Replace with real editorial content before launch.',
   'landscaping', 7)
) as v(title, slug, excerpt, content, category_slug, days_ago)
join public.categories c on c.slug = v.category_slug;

-- ----------------------------------------------------------------------------
-- Monetization catalog (plans only -- no subscriptions/transactions without
-- real businesses/billing wired up).
-- ----------------------------------------------------------------------------

insert into public.plans (name, slug, description, price_cents, billing_interval, features, sort_order) values
  ('Basic', 'basic', 'Free listing with a standard business profile.', 0, 'month', '["business_profile", "up_to_5_projects"]'::jsonb, 1),
  ('Featured', 'featured', 'Priority placement in category and location browse pages.', 9900, 'month', '["business_profile", "unlimited_projects", "featured_placement"]'::jsonb, 2),
  ('Premium', 'premium', 'Featured placement plus priority lead matching.', 24900, 'month', '["business_profile", "unlimited_projects", "featured_placement", "priority_lead_matching"]'::jsonb, 3);
